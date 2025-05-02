import { Alert, Platform } from "react-native";
import { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";
import * as Crypto from "expo-crypto";

// const backendURL = process.env.EXPO_PUBLIC_BACKEND_API_URL;
// const backendURL = Platform.OS === "web" ? "http://127.0.0.1:8000" : "http://10.0.2.2:8000";
const backendURL =
  Platform.OS === "web" ? "http://127.0.0.1:8000" : "http://192.168.2.59:8000";
// const backendURL = Platform.OS === "web" ? "http://127.0.0.1:8000" : "http://10.0.0.145:8000";

// Book interface
export interface Book {
  id: string;
  title: string;
  author: string;
  img_url?: string;
  type?: string;
  size?: number;
}

// Highlight interface
export interface Highlight {
  id: string;
  user_id: string;
  book_id: string;
  text: string;
  location: string;
  img_url?: string;
  img_prompt?: string;
}

export interface Selection {
  id?: string;
  text: string;
  location: string;
  imgUrl?: string;
}

// This method will fetch all the books for the currently logged
export async function getAllBooks(session: Session) {
  const response = await fetch(backendURL + `/books`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  // Check for 204 No Content and return an empty array if that's the case
  if (response.status === 204) {
    return [];
  } else if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    throw new Error("Failed to fetch books");
  }
}

// This method will fetch the book by bookId
export async function getBookByBookId(session: Session, bookId: string) {
  let response = await fetch(backendURL + `/book/${bookId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data.url;
  } else {
    console.error("Error fetching book:", response.statusText);
    Alert.alert("Failed to fetch book.");
  }
}

// This method will upload the book to S3 and metadata to mongoDB
export async function uploadBookToDB(session: Session, bookData: any) {
  const response = await fetch(backendURL + `/book`, {
    method: "POST",
    body: bookData,
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.status === 200) {
    console.log("Book uploaded successfully!");
    Alert.alert("Success", "Book uploaded successfully!");
    const newBookData = await response.json();
    return newBookData;
  } else {
    console.error("Failed to upload book", response);
    Alert.alert("Error", "Failed to upload book");
  }
}

// This method will get book details from mongoDB
export async function getBookMetaData(session: Session, bookId: string) {
  const response = await fetch(backendURL + `/book/info/${bookId}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    Alert.alert("Error", "Failed to fetch book details");
  }
}

// This method will delete the book from both S3 and mongoDB
export async function deleteUserSelectedBook(session: Session, bookId: string) {
  const response = await fetch(backendURL + `/book/${bookId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    console.debug(data.message);
    return true;
  } else {
    const error = await response.json();
    console.log(`Exception while deleting book: ${error}.`);
    return false;
  }
}

// This method will get all the highlights for the user selected book
export async function getAllHighlightsByBookId(
  session: Session,
  bookId: string
) {
  const response = await fetch(backendURL + `/book/${bookId}/highlights`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  // Handle 204 No Content response by returning an empty array
  if (response.status === 204) {
    return [];
  } else if (response.ok) {
    const data = await response.json();
    return data;
  } else {
    const error = await response.json();
    alert(`Error while getting book highlights: ${error.message}.`);
  }
}

// Delete highlight function
export async function deleteHighlight(
  session: Session,
  bookId: string,
  highlightId: string
) {
  const response = await fetch(
    backendURL + `/book/${bookId}/highlight/${highlightId}`,
    {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  // throw error if bad response
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to delete highlight: ${errorData.message}`);
  }
}

// Delete highlight function
export async function deleteHighlightImage(
  session: Session,
  bookId: string,
  highlightId: string
) {
  const response = await fetch(
    `${backendURL}/book/${bookId}/highlight/${highlightId}/image`,
    {
      method: "DELETE",
      headers: session.authorizationHeaders(),
    }
  );

  // throw error if bad response
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to delete highlight image: ${errorData.message}`);
  }
}

// Generate a new image for a highlight with no image
export async function generateHighlightImage(
  session: Session,
  bookId: string,
  highlightId: string
) {
  const url = `${backendURL}/book/${bookId}/highlight/${highlightId}/generate`;
  const response = await fetch(url, {
    method: "POST",
    headers: session.authorizationHeaders(),
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Image successfully generated:", data.imgUrl);
    return data.imgUrl;
  } else {
    const error = await response.json();
    console.error("Failed to generate highlight image:", error);
    throw new Error("Failed to generate highlight image.");
  }
}

// Regenerate the highlight image with a PUT request
export async function regenerateHighlightImage(
  session: Session,
  bookId: string,
  highlightId: string
) {
  const url = `${backendURL}/book/${bookId}/highlight/${highlightId}`;
  const response = await fetch(url, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.ok) {
    console.log("Image regeneration succeeded");
    return true;
  } else {
    const error = await response.json();
    console.error("Image regeneration failed:", error);
    throw new Error("Failed to regenerate highlight image.");
  }
}

// Fetch the updated highlight data with a GET request
export async function fetchUpdatedHighlight(
  session: Session,
  bookId: string,
  highlightId: string
) {
  const url = `${backendURL}/book/${bookId}/highlight/${highlightId}`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${session.access_token}`,
    },
  });

  if (response.ok) {
    const data = await response.json();
    console.log("Fetched updated highlight data successfully");
    return data;
  } else {
    const error = await response.json();
    console.error("Failed to fetch updated highlight data:", error);
    throw new Error("Failed to fetch updated highlight data.");
  }
}

// This method will create a new highlight for the user
export async function createUserHighlight(
  session: Session,
  bookId: string,
  selection: Selection
) {
  const response = await fetch(backendURL + `/book/${bookId}/highlight`, {
    method: "POST",
    body: JSON.stringify(selection),
    headers: session.authorizationHeaders(),
  });

  if (response.status === 200) {
    // return true;
    return await response.json();
  } else return null;
}

// This method will create a new highlight for the user
// export async function visualizeHighlight(
//   session: Session,
//   bookId: string,
//   selection: Selection
// ) {
//
//   // const url = `http://localhost:8000/book/${bookId}/highlight?image=true`;
//
//   // const response = await fetch(backendURL + `/book/${bookId}/highlight?image=true`, {
//   // // const response = await fetch(url, {
//   //   method: "POST",
//   //   body: JSON.stringify(selection),
//   //   headers: user.authorizationHeaders(),
//   // });
//
//   console.log(JSON.stringify(selection));
//
//   const response = await fetch(backendURL + `/book/${bookId}/highlight?image=true`, {
//     method: "POST",
//     body: JSON.stringify(selection),
//     headers: {
//       Authorization: `Bearer ${session.access_token}`,
//       "Content-Type": "application/json"
//     }
//   });
//
//   if (response.status === 200) {
//     // return true;
//     return await response.json();
//   }
//   else
//     return null;
// }

export async function updateBookSettings(
  session: Session,
  bookId: string,
  settings: { font_size: string; dark_mode: boolean }
) {
  const response = await fetch(`${backendURL}/book/${bookId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(settings),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Failed to update book settings: ${errorData.message}`);
  }
}

// Fetch the settings for a specific book
export async function getBookSettings(session: Session, bookId: string) {
  try {
    const response = await fetch(`${backendURL}/book/${bookId}/settings`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data; // Return the settings object (e.g., { fontSize, darkMode })
    } else {
      const errorData = await response.json();
      console.error("Failed to fetch book settings:", errorData.message);
      throw new Error("Failed to fetch book settings.");
    }
  } catch (error) {
    console.error("Error in getBookSettings:", error);
    throw error;
  }
}

export async function createCustomImage(
  session: Session,
  bookId: string,
  highlightId: string,
  customText: string
) {
  const response = await fetch(
    backendURL + `/book/${bookId}/highlight/${highlightId}`,
    {
      method: "PUT",
      body: JSON.stringify(customText),
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    }
  );

  if (response.status === 200) {
    console.log("Image regeneration succeeded");
    return true;
  } else {
    const error = await response.json();
    console.error("Image regeneration failed:", error);
    throw new Error("Failed to regenerate highlight image.");
  }
}

export async function createHighlight(
  book_id: string,
  location: string,
  text: string,
  visualize: boolean = false
): Promise<Highlight> {
  // get user
  const getUserRes = await supabase.auth.getUser();
  if (getUserRes.error) throw getUserRes.error;

  // Save highlight to database
  const saveHighlightRes = await supabase.from("highlights").insert({
    user_id: getUserRes.data.user?.id,
    book_id,
    text,
    location,
  });

  // Handle any database errors
  if (saveHighlightRes.error) {
    throw saveHighlightRes.error;
  }

  // Get newly created highlight id
  const selHighIdRes = await supabase
    .from("highlights")
    .select("id")
    .eq("location", location)
    .is("img_url", null)
    .limit(1)
    .single();

  // Handle any database errors
  if (selHighIdRes.error) {
    throw selHighIdRes.error;
  }

  const highlightId = selHighIdRes.data.id;

  // if user wants to visualize
  if (visualize) {
    return await visualizeHighlight(highlightId, text);
  } else {
    // Get newly created highlight id
    const { data, error } = await supabase
      .from("highlights")
      .select("*")
      .eq("id", highlightId)
      .limit(1)
      .single();

    // Handle any database errors
    if (error) {
      throw error;
    }

    return data;
  }
}

export async function visualizeHighlight(
  highlightId: string,
  prompt: string
): Promise<Highlight> {
  const image_id = Crypto.randomUUID();

  const genImageRes = await supabase.functions.invoke<{ img_url: string }>(
    "generate-image",
    {
      body: {
        image_id,
        prompt,
      },
    }
  );

  if (genImageRes.error) {
    console.error("function visualizeHighlight: genImageRes Error");
    throw genImageRes.error;
  }

  if (genImageRes.data) {
    // Get old img url
    const getHighlightRes = await supabase
      .from("highlights")
      .select("img_url")
      .eq("id", highlightId)
      .limit(1)
      .single();

    if (getHighlightRes.error) {
      console.error("Function visualizeHighlight: getHighlightRes Error");
      throw getHighlightRes.error;
    }

    const oldImgUrl: string = getHighlightRes.data.img_url;

    if (oldImgUrl) {
      const imgPath = oldImgUrl.split("images/")[1];

      // Delete old image
      const deleteImgRes = await supabase.storage
        .from("images")
        .remove([imgPath]);

      if (deleteImgRes.error) {
        console.error("Function visualizeHighlight: deleteImgRes Error");
        throw deleteImgRes.error;
      }
    }

    // Update highlight with new image url
    const updateHighlightRes = await supabase
      .from("highlights")
      .update({
        img_url: genImageRes.data.img_url,
        img_prompt: prompt,
      })
      .eq("id", highlightId);

    // Handle any database errors
    if (updateHighlightRes.error) {
      console.error("function visualizeHighlight: updateHighlightRes Error");
      throw updateHighlightRes.error;
    }
  }

  // Get updated highlight details
  const { data, error } = await supabase
    .from("highlights")
    .select("*")
    .eq("id", highlightId)
    .limit(1)
    .single();

  // Handle any database errors
  if (error) {
    console.error("function visualizeHighlight: retrieveHighlight Error");
    throw error;
  }

  return data;
}

export async function improvePrompt(
  bookTitle: string,
  passage: string
): Promise<string> {
  const prompt = `Create a prompt for image generation based on the book "${bookTitle}", for the passage: "${passage}"`;

  const response = await fetch(
    "https://api-inference.huggingface.co/models/meta-llama/Llama-2-7b-chat-hf",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.HUGGING_FACE_ACCESS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to enhance prompt: ${response.statusText}`);
  }

  const result = await response.json();

  // LLaMA returns: [{ generated_text: "..." }]
  return result[0]?.generated_text?.trim() || prompt;
}
