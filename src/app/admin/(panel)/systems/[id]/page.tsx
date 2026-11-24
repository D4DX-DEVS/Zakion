import { notFound } from "next/navigation";
import { db } from "@/lib/env";
import { parseFeatures, SYSTEM_FIELDS, type System } from "@/lib/content";
import { richOrText } from "@/lib/html";
import { deleteSystem, saveSystem, uploadSectionFile } from "../../../actions";
import { Icon } from "../../../icons";
import { libraryImages } from "../../../library-images";
import { SectionEditor } from "../../../section-editor";
import { Toast } from "../../../ui";

// Admin > Systems > one system: its name and web address, the thumbnail on the card, and what its own page shows (label, heading, text,
// pictures, benefits and optional extra details).
export default async function EditSystem({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const isNew = id === "new";
  const x = isNew ? null : await db().prepare("SELECT * FROM systems WHERE id=?").bind(id).first<System>().catch(() => null);
  if (!isNew && !x) notFound();
  const next = isNew ? await db().prepare("SELECT COALESCE(MAX(sort),0)+1 AS n FROM systems").first<{ n: number }>().then((r) => r?.n ?? 1).catch(() => 1) : 0;
  const initial = x
    ? { title: x.title, slug: x.slug, visible: x.status === "draft" ? "Hidden" : "Shown", thumb: x.thumb, badge: x.badge, heading: x.heading, text: x.text, image: x.image, image2: x.image2, features: parseFeatures(x.features), details: richOrText(x.details), sort: x.sort }
    : { title: "", slug: "", visible: "Shown", thumb: "", badge: "", heading: "", text: "", image: "", image2: "", features: [], details: "", sort: next };
  return (
    <>
      <div className="pagehead">
        <a className="back" href="/admin/systems"><Icon name="arrowLeft" size={16} />All systems</a>
        <h2>{isNew ? "Add a system" : x!.title || "Edit system"}</h2>
        {x && <span className={"chip " + x.status}>{x.status}</span>}
        {x && x.status === "published" && <a className="btn sec sm" href={`/services/${x.slug}/`} target="_blank" rel="noreferrer"><Icon name="external" size={15} />View on the website<span className="sr-only"> (opens in a new tab)</span></a>}
      </div>
      {saved && <Toast text="System saved" />}
      {error && <p className="alert" role="alert">The system could not be saved. Please try again.</p>}
      <SectionEditor
        key={id + (saved ?? "")}
        sectionKey={id}
        fields={SYSTEM_FIELDS}
        initial={initial}
        images={await libraryImages()}
        save={saveSystem}
        reset={isNew ? undefined : deleteSystem}
        resetLabel="Delete system"
        resetConfirm="Delete this system for good? Its card and page are removed from the website and this cannot be undone."
        resetIcon="trash"
        upload={uploadSectionFile}
      />
    </>
  );
}
