"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { useStore } from "@/components/StoreProvider";
import {
  deleteCategoryAction,
  saveCategoryAction,
} from "@/lib/actions/admin/categories";
import { formatAdminDate } from "@/lib/admin/format";

export type AdminCategory = {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  productCount: number;
};

export default function CategoryManager({
  categories,
}: {
  categories: AdminCategory[];
}) {
  const router = useRouter();
  const { toast } = useStore();
  const [pending, startTransition] = useTransition();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editSlug, setEditSlug] = useState("");

  function create() {
    startTransition(async () => {
      const result = await saveCategoryAction({ name, slug });
      if (!result.ok) {
        toast(result.error ?? "Could not create category.");
        return;
      }

      setName("");
      setSlug("");
      toast(result.message ?? "Category created.");
      router.refresh();
    });
  }

  function startEdit(category: AdminCategory) {
    setEditingId(category.id);
    setEditName(category.name);
    setEditSlug(category.slug);
  }

  function saveEdit(category: AdminCategory) {
    setBusyId(category.id);
    startTransition(async () => {
      const result = await saveCategoryAction({
        id: category.id,
        name: editName,
        slug: editSlug,
      });

      setBusyId(null);

      if (!result.ok) {
        toast(result.error ?? "Could not update category.");
        return;
      }

      setEditingId(null);
      toast(result.message ?? "Category updated.");
      router.refresh();
    });
  }

  function remove(category: AdminCategory) {
    if (
      !window.confirm(
        category.productCount
          ? `Delete "${category.name}"? It has ${category.productCount} product(s), so deletion will be blocked until they are moved.`
          : `Delete "${category.name}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setBusyId(category.id);
    startTransition(async () => {
      const result = await deleteCategoryAction({ id: category.id });
      setBusyId(null);

      if (!result.ok) {
        toast(result.error ?? "Could not delete category.");
        return;
      }

      toast(result.message ?? "Category deleted.");
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-mist bg-white p-5">
        <h2 className="d text-lg">Add category</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
          <label className="text-xs font-semibold">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Gloves"
              className="mt-1 w-full rounded border border-steel px-3 py-2 text-sm font-normal"
            />
          </label>
          <label className="text-xs font-semibold">
            Slug (optional)
            <input
              value={slug}
              onChange={(event) => setSlug(event.target.value)}
              placeholder="auto-generated"
              className="mt-1 w-full rounded border border-steel px-3 py-2 text-sm font-normal"
            />
          </label>
          <button
            type="button"
            onClick={create}
            disabled={pending || name.trim().length < 2}
            className="self-end rounded bg-ink px-4 py-2 text-sm font-bold text-gold disabled:opacity-50"
          >
            {pending && !busyId ? "Creating..." : "Add category"}
          </button>
        </div>
      </section>

      <div className="overflow-x-auto rounded-xl border border-mist bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-mist text-coal/60">
            <tr>
              <th className="px-4 py-3 font-semibold">Name</th>
              <th className="px-4 py-3 font-semibold">Slug</th>
              <th className="px-4 py-3 font-semibold">Products</th>
              <th className="px-4 py-3 font-semibold">Created</th>
              <th className="px-4 py-3 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length ? (
              categories.map((category) => {
                const editing = editingId === category.id;
                const busy = busyId === category.id;

                return (
                  <tr key={category.id} className="border-t border-mist">
                    <td className="px-4 py-3">
                      {editing ? (
                        <input
                          value={editName}
                          onChange={(event) => setEditName(event.target.value)}
                          className="w-full rounded border border-steel px-2 py-1.5 text-sm"
                        />
                      ) : (
                        <span className="font-semibold">{category.name}</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editing ? (
                        <input
                          value={editSlug}
                          onChange={(event) => setEditSlug(event.target.value)}
                          className="w-full rounded border border-steel px-2 py-1.5 font-mono text-xs"
                        />
                      ) : (
                        <span className="font-mono text-xs">
                          {category.slug}
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">{category.productCount}</td>
                    <td className="px-4 py-3 text-xs text-coal/65">
                      {formatAdminDate(category.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-3 text-xs font-semibold">
                        {editing ? (
                          <>
                            <button
                              type="button"
                              onClick={() => saveEdit(category)}
                              disabled={busy || editName.trim().length < 2}
                              className="underline disabled:opacity-40"
                            >
                              {busy ? "Saving..." : "Save"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingId(null)}
                              className="underline"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={() => startEdit(category)}
                              className="underline"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => remove(category)}
                              disabled={busy}
                              className="text-red-700 underline disabled:opacity-40"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-coal/60">
                  No categories yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
