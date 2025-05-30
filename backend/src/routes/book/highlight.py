import os
import boto3
from fastapi import APIRouter, HTTPException, Request, status, Response, Body
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from pydantic import BaseModel
from ...database.mongodb import get_mongodb_collection
from ...models.highlight import Highlight
from ...utils.text2image import overwrite_image, generate_image

load_dotenv()
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")
AWS_REGION = os.getenv("COGNITO_REGION")
s3_client = boto3.client('s3')

# Define S3 client outside the route for reuse
s3 = boto3.client('s3')

router = APIRouter(prefix="/book/{book_id}")




# Pydantic model for the input
class CreateHighlight(BaseModel):
    text: str
    location: str

# POST /book/:id/highlight - Add a highlight to the book's metadata
@router.post("/highlight", tags=["highlight"])
async def add_book_highlight(request: Request, book_id: str, body: CreateHighlight, image: bool = False):
    # owner_id = request.state.user["id"]

    # Call create_highlight from Highlight model
    # highlight = Highlight(text=body.text, location=body.location, book_id=book_id, owner_id=owner_id)
    # print(body.text)
    highlight = Highlight(text=body.text, location=body.location, book_id="the_count_of_monte_cristo", owner_id="books")
    return highlight.create_highlight(image)




@router.get("/highlights", tags=["highlight"])
async def get_all_highlights(request: Request, book_id: str):
    owner_id = request.state.user["id"]

    # Call the static method with required arguments
    highlight_instance = Highlight(book_id=book_id, owner_id=owner_id)
    highlights = highlight_instance.get_highlights()

    # If there are no highlights, return a 204 No Content status
    if not highlights:
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    return JSONResponse(content=highlights)



# GET /book/:id/highlight - Get highlight by id
@router.get("/highlight/{highlight_id}", tags=["highlight"])
async def get_book_highlight(request: Request, book_id: str, highlight_id: str):
    owner_id = request.state.user["id"]

    # Instantiate a Highlight object with bookId, ownerId, and highlight_id
    highlight_instance = Highlight(id=highlight_id, book_id=book_id, owner_id=owner_id)
    highlight = highlight_instance.get_highlight_by_id()

    return JSONResponse(content=highlight, status_code=status.HTTP_200_OK)




# Delete Highlight API
@router.delete("/highlight/{highlightid}", tags=["highlight"])
async def delete_highlight(request: Request, book_id: str, highlightid: str):
    owner_id = request.state.user["id"]

    # Call delete_highlight from Highlight model
    highlight_instance = Highlight(id=highlightid, book_id=book_id, owner_id=owner_id)
    highlight_instance.delete_highlight()

    return JSONResponse(status_code=status.HTTP_200_OK, content={"message": "Successfully deleted highlight!"})



@router.put("/highlight/{highlight_id}", tags=["highlight"])
async def regenerate_highlight_image(
    request: Request,
    book_id: str,
    highlight_id: str,
    new_text: str = Body(None)
):
    owner_id = request.state.user["id"]

    # Query the MongoDB for the book document and find the highlight by ID
    collection = get_mongodb_collection(owner_id)
    book_metadata = collection.find_one({"_id": book_id})

    if not book_metadata:
        raise HTTPException(status_code=404, detail="Book not found")

    # Extract the highlight data based on highlight_id
    highlight_data = next(
        (highlight for highlight in book_metadata.get("highlights", []) if highlight["id"] == highlight_id),
        None
    )
    if not highlight_data:
        raise HTTPException(status_code=404, detail="Highlight not found")

    # Check if the image URL exists and is not null or "null"
    img_url = highlight_data.get("imgUrl")
    image_exists = img_url not in [None, "null"] and bool(img_url.strip())

    # Use the provided new_text if present, otherwise fall back to the existing highlight text
    prompt = new_text if new_text else highlight_data.get("text")
    if not prompt:
        raise HTTPException(status_code=500, detail="Highlight text is missing")

    # Prepare S3 key for the image
    s3_key = f"{owner_id}/{book_id}/images/{highlight_id}.png"
    print(f"S3 Key: {s3_key}")

    # Call the appropriate function based on whether the image exists
    if image_exists:
        print("Overwriting existing image...")
        overwrite_image(prompt, s3_key)
    else:
        print("Generating new image...")
        generate_image(prompt, owner_id, highlight_id, book_id)

    # Construct the image URL
    img_url = f"https://{S3_BUCKET_NAME}.s3.{AWS_REGION}.amazonaws.com/{s3_key}"

    return JSONResponse(
        status_code=200,
        content={
            "message": "Image successfully regenerated and overwritten in S3." if image_exists
                       else "Image successfully generated and uploaded to S3.",
            "highlight_id": highlight_id,
            "imgUrl": img_url,
            "imageExists": image_exists
        }
    )

@router.post("/highlight/{highlight_id}/generate", tags=["highlight"])
async def generate_new_image(request: Request, book_id: str, highlight_id: str):
    owner_id = request.state.user["id"]

    # Query the MongoDB for the book document and find the highlight by ID
    collection = get_mongodb_collection(owner_id)
    book_metadata = collection.find_one({"_id": book_id})

    if not book_metadata:
        raise HTTPException(status_code=404, detail="Book not found")

    # Extract the highlight data based on highlight_id
    highlight_data = next(
        (highlight for highlight in book_metadata.get("highlights", []) if highlight["id"] == highlight_id),
        None
    )
    if not highlight_data:
        raise HTTPException(status_code=404, detail="Highlight not found")

    # Generate the new image
    prompt = highlight_data.get("text")
    if not prompt:
        raise HTTPException(status_code=500, detail="Highlight text is missing")

    s3_key = f"{owner_id}/{book_id}/images/{highlight_id}.png"
    img_url = generate_image(prompt, owner_id, highlight_id, book_id)

    # Update the highlight in MongoDB with the new imgUrl
    collection.update_one(
        {"_id": book_id, "highlights.id": highlight_id},
        {"$set": {"highlights.$.imgUrl": img_url}}
    )

    return JSONResponse(
        status_code=200,
        content={"message": "Image successfully generated.", "imgUrl": img_url}
    )


@router.delete("/highlight/{highlight_id}/image", tags=["highlight"])
async def delete_highlight_image(request: Request, book_id: str, highlight_id: str):
    owner_id = request.state.user["id"]

    # Query the MongoDB for the book document and find the highlight by ID
    collection = get_mongodb_collection(owner_id)
    book_metadata = collection.find_one({"_id": book_id})

    # Extract the highlight based on highlight_id
    if book_metadata:
        highlight_data = next((highlight for highlight in book_metadata.get("highlights", []) if highlight["id"] == highlight_id), None)
    else:
        raise HTTPException(status_code=404, detail="Book not found")

    if not highlight_data:
        raise HTTPException(status_code=404, detail="Highlight not found")

    # Delete the image from S3 if it exists
    img_url = highlight_data.get("imgUrl")
    if img_url:
        s3_key = f"{owner_id}/{book_id}/images/{highlight_id}.png"
        try:
            s3_client.delete_object(Bucket=S3_BUCKET_NAME, Key=s3_key)
        except s3_client.exceptions.NoSuchKey:
            raise HTTPException(status_code=404, detail="Image not found in S3")

        # Set the image URL to null in the database
        highlight_data["imgUrl"] = None
        collection.update_one(
            {"_id": book_id, "highlights.id": highlight_id},
            {"$set": {"highlights.$.imgUrl": None}}
        )
    else:
        raise HTTPException(status_code=404, detail="Image not found")

    return JSONResponse(
        status_code=200,
        content={"message": "Successfully removed image from highlight"}
    )
