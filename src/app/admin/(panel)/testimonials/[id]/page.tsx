import { notFound } from "next/navigation";
import { db } from "@/lib/env";
import { TESTIMONIAL_FIELDS, type Testimonial } from "@/lib/content";
import { deleteTestimonial, saveTestimonial, uploadSectionFile } from "../../../actions";
import { Icon } from "../../../icons";
import { libraryImages } from "../../../library-images";
import { SectionEditor } from "../../../section-editor";
import { Toast } from "../../../ui";

// Admin > Testimonials > one testimonial: who said it, the photo, the written quote and/or a video.
export default async function EditTestimonial({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const isNew = id === "new";
  const x = isNew ? null : await db().prepare("SELECT * FROM testimonials WHERE id=?").bind(id).first<Testimonial>().catch(() => null);
  if (!isNew && !x) notFound();
  const initial = x
    ? { name: x.name, role: x.role, company: x.company, visible: x.status === "draft" ? "Hidden" : "Shown", quote: x.quote, avatar: x.avatar, video: x.video, poster: x.poster }
    : { name: "", role: "", company: "", visible: "Shown", quote: "", avatar: "", video: "", poster: "" };
  return (
    <>
      <div className="pagehead">
        <a className="back" href="/admin/testimonials"><Icon name="arrowLeft" size={16} />All testimonials</a>
        <h2>{isNew ? "Add a testimonial" : x!.name || "Edit testimonial"}</h2>
        {x && <span className={"chip " + x.status}>{x.status}</span>}
        {x && x.status === "published" && <a className="btn sec sm" href={`/testimonials/#testimonial-${x.id}`} target="_blank" rel="noreferrer"><Icon name="external" size={15} />View on the website<span className="sr-only"> (opens in a new tab)</span></a>}
      </div>
      {saved && <Toast text="Testimonial saved" />}
      {error && <p className="alert" role="alert">The testimonial could not be saved. Please try again.</p>}
      <SectionEditor
        key={id + (saved ?? "")}
        sectionKey={id}
        fields={TESTIMONIAL_FIELDS}
        initial={initial}
        images={await libraryImages()}
        save={saveTestimonial}
        reset={isNew ? undefined : deleteTestimonial}
        resetLabel="Delete testimonial"
        resetConfirm="Delete this testimonial for good? It is removed from the website and this cannot be undone."
        resetIcon="trash"
        upload={uploadSectionFile}
      />
    </>
  );
}
