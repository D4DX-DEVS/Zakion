import { notFound } from "next/navigation";
import { db } from "@/lib/env";
import { FAQ_FIELDS, type Faq } from "@/lib/content";
import { deleteFaq, saveFaq, uploadSectionFile } from "../../../actions";
import { Icon } from "../../../icons";
import { SectionEditor } from "../../../section-editor";
import { Toast } from "../../../ui";

// Admin > FAQs > one question: the question, its answer, the category it is grouped under, its position and whether it is shown.
export default async function EditFaq({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string; error?: string }> }) {
  const { id } = await params;
  const { saved, error } = await searchParams;
  const isNew = id === "new";
  const x = isNew ? null : await db().prepare("SELECT * FROM faqs WHERE id=?").bind(id).first<Faq>().catch(() => null);
  if (!isNew && !x) notFound();
  const last = isNew ? ((await db().prepare("SELECT MAX(sort) AS m FROM faqs").first<{ m: number | null }>().catch(() => null))?.m ?? 0) + 1 : 0;
  const initial = x
    ? { question: x.question, answer: x.answer, category: x.category, sort: x.sort, visible: x.status === "draft" ? "Hidden" : "Shown" }
    : { question: "", answer: "", category: "General", sort: last, visible: "Shown" };
  return (
    <>
      <div className="pagehead">
        <a className="back" href="/admin/faqs"><Icon name="arrowLeft" size={16} />All questions</a>
        <h2>{isNew ? "Add a question" : x!.question || "Edit question"}</h2>
        {x && <span className={"chip " + x.status}>{x.status}</span>}
        {x && x.status === "published" && <a className="btn sec sm" href={`/faq/#faq-${x.id}`} target="_blank" rel="noreferrer"><Icon name="external" size={15} />View on the website<span className="sr-only"> (opens in a new tab)</span></a>}
      </div>
      {saved && <Toast text="Question saved" />}
      {error === "empty" && <p className="alert" role="alert">Please type the question before saving.</p>}
      {error && error !== "empty" && <p className="alert" role="alert">The question could not be saved. Please try again.</p>}
      <SectionEditor
        key={id + (saved ?? "")}
        sectionKey={id}
        fields={FAQ_FIELDS}
        initial={initial}
        images={[]}
        save={saveFaq}
        reset={isNew ? undefined : deleteFaq}
        resetLabel="Delete question"
        resetConfirm="Delete this question for good? It is removed from the website and this cannot be undone."
        resetIcon="trash"
        upload={uploadSectionFile}
      />
    </>
  );
}
