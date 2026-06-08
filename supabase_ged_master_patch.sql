create or replace function public.app_get_all_documents()
returns table (
    document_id uuid,
    title text,
    description text,
    viewer_url text,
    file_type text,
    is_active boolean
)
language sql
security definer
set search_path = public
as $$
    select
        d.id::uuid as document_id,
        d.title,
        coalesce(d.description, '') as description,
        regexp_replace(r.file_url, '^documents/', '') as viewer_url,
        coalesce(r.file_type, 'unknown') as file_type,
        (d.status = 'active') as is_active
    from public.documents d
    left join public.document_revisions r on r.id = d.current_revision_id
    where d.status = 'active'
      and r.id is not null
    order by d.title asc
$$;

grant execute on function public.app_get_all_documents() to anon, authenticated;
