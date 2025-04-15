CREATE POLICY "All Access 1ffg0oo_0"
  ON "storage"."objects"
  FOR SELECT
  USING (("bucket_id" = 'images'));

CREATE POLICY "All Access 1ffg0oo_1"
  ON "storage"."objects"
  FOR UPDATE
  USING (("bucket_id" = 'images'));

CREATE POLICY "All Access 1ffg0oo_2"
  ON "storage"."objects"
  FOR INSERT
  WITH CHECK (("bucket_id" = 'images'));

CREATE POLICY "All Access 1ffg0oo_3"
  ON "storage"."objects"
  FOR DELETE
  USING (("bucket_id" = 'images'));
