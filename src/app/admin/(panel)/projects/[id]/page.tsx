import { notFound } from "next/navigation";
import { db, env } from "@/lib/env";
import { BUILTIN_IMAGES, NO_SYSTEM, parseGallery, PROJECT_FIELDS, type Project } from "@/lib/content";
import { richOrText } from "@/lib/html";
import { deleteProject, saveProject, uploadSectionFile } from "../../../actions";
import { Icon } from "../../../icons";
import { SectionEditor } from "../../../section-editor";
import { Toast } from "../../../ui";

// Admin > Projects > one project: name, category, location, description, the details shown in the boxes, the main picture and the gallery.
export default async function EditProject({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const isNew = id === "new";
  const p = isNew ? null : await db().prepare("SELECT * FROM projects WHERE id=?").bind(id).first<Project>().catch(() => null);
  if (!isNew && !p) notFound();
  const next = isNew ? await db().prepare("SELECT COALESCE(MAX(sort),0)+1 AS n FROM projects").first<{ n: number }>().then((r) => r?.n ?? 1).catch(() => 1) : 0;
  const n = (x: string) => parseFloat(x) || 0;
  const initial = p
    ? { title: p.title, slug: p.slug, stage: p.stage === "ongoing" ? "Ongoing" : "Completed", visible: p.status === "draft" ? "Hidden" : "Shown", category: p.category, location: p.location, image: p.image, systemType: p.system_type || NO_SYSTEM, capacity: n(p.capacity),
        pvDetails: p.pv_details, pcuDetails: p.pcu_details, completion: p.completion, generation: p.generation, savings: p.savings, payback: p.payback, summary: richOrText(p.summary),
        testimonialQuote: p.testimonial_quote, testimonialVideo: p.testimonial_video, testimonialImage: p.testimonial_image, gallery: parseGallery(p.gallery).map((image) => ({ image })), co2: n(p.co2), trees: n(p.trees), coal: n(p.coal), sort: p.sort }
    : { title: "", slug: "", stage: "Completed", visible: "Shown", category: "Residential", location: "", image: "", systemType: NO_SYSTEM, capacity: 0, pvDetails: "", pcuDetails: "", completion: "", generation: "", savings: "", payback: "", summary: "",
        testimonialQuote: "", testimonialVideo: "", testimonialImage: "", gallery: [], co2: 0, trees: 0, coal: 0, sort: next };
  const uploaded = (await env().MEDIA.list({ limit: 1000 })).objects
    .filter((o) => /\.(png|jpe?g|webp|gif|svg)$/i.test(o.key) && !/-\d+x\d+\.\w+$/.test(o.key) && !o.key.startsWith("_snap/") && !o.key.startsWith("elementor/"))
    .sort((a, b) => b.uploaded.getTime() - a.uploaded.getTime()).slice(0, 150).map((o) => "/media/" + o.key);
  return (
    <>
      <div className="pagehead">
        <a className="back" href="/admin/projects"><Icon name="arrowLeft" size={16} />All projects</a>
        <h2>{isNew ? "Add a project" : p!.title || "Edit project"}</h2>
        {p && <span className={"chip " + p.status}>{p.status}</span>}
        {p && p.status === "published" && <a className="btn sec sm" href={`/projects/${p.slug}/`} target="_blank" rel="noreferrer"><Icon name="external" size={15} />View on the website<span className="sr-only"> (opens in a new tab)</span></a>}
      </div>
      {saved && <Toast text="Project saved" />}
      {error && <p className="alert" role="alert">The project could not be saved. Please try again.</p>}
      <SectionEditor
        key={id + (saved ?? "")}
        sectionKey={id}
        fields={PROJECT_FIELDS}
        initial={initial}
        images={[...uploaded, ...BUILTIN_IMAGES]}
        save={saveProject}
        reset={isNew ? undefined : deleteProject}
        resetLabel="Delete project"
        resetConfirm="Delete this project for good? Its page is removed from the website and this cannot be undone."
        resetIcon="trash"
        upload={uploadSectionFile}
      />
    </>
  );
}
