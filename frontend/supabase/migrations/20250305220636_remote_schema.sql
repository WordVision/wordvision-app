create policy "only authenticated allowed to query 1jx2ne_0"
on "storage"."objects"
as permissive
for select
to authenticated
using ((bucket_id = 'books'::text));



