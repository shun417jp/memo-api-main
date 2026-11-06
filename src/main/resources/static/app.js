"use strict";
const $ = (id) => document.getElementById(id);
let notes = [];
let selectedId = null;
let detailRequest = 0;
let listRequest = 0;
let saving = false;
let toastTimer;
const dateFormat = new Intl.DateTimeFormat("ja-JP", { year: "numeric", month: "long", day: "numeric" });
function dateLabel(value) {
  if (!value) return "作成日未設定";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "作成日未設定" : dateFormat.format(date);
}
async function api(path = "", options = {}) {
  let response;
  try {
    response = await fetch(`/api/notes${path}`, { ...options, signal: AbortSignal.timeout(15000) });
  } catch {
    throw new Error(options.method === "POST"
      ? "保存結果を確認できませんでした。入力は残っています。一度閉じて一覧を再読み込みし、保存済みか確認してください。"
      : "サーバーに接続できません。接続を確認して再試行してください。");
  }
  if (!response.ok) {
    const messages = { 400: "入力内容を確認してください。", 404: "このメモは見つかりませんでした。", 401: "アクセスが許可されていません。", 403: "アクセスが許可されていません。" };
    throw new Error(messages[response.status] || "メモを取得・保存できませんでした。しばらくしてから再試行してください。");
  }
  return response.json();
}
function showError(id, message) {
  $(id).hidden = !message;
  $(id).querySelector("span").textContent = message || "";
}
function renderList() {
  const query = $("search").value.trim().toLocaleLowerCase();
  const filtered = notes.filter((note) => `${note.title || ""}\n${note.content || ""}`.toLocaleLowerCase().includes(query));
  $("note-count").textContent = query ? `${filtered.length}件 / ${notes.length}件のメモ` : `${notes.length}件のメモ`;
  $("note-list").replaceChildren();
  for (const note of filtered) {
    const item = document.createElement("li");
    const button = document.createElement("button");
    button.type = "button";
    button.className = "note-row";
    button.setAttribute("aria-current", String(note.id === selectedId));
    const time = document.createElement("time");
    time.textContent = dateLabel(note.createdAt);
    if (note.createdAt) time.dateTime = note.createdAt;
    const title = document.createElement("strong");
    title.textContent = note.title || "無題のメモ";
    const preview = document.createElement("p");
    preview.textContent = note.content || "本文はありません";
    button.append(time, title, preview);
    button.addEventListener("click", () => selectNote(note.id, true));
    item.append(button);
    $("note-list").append(item);
  }
  $("list-empty").hidden = filtered.length > 0;
  $("list-empty").textContent = query ? "一致するメモがありません。別の言葉で検索してください。" : "まだメモがありません。「新しいメモ」から最初のひとつを書いてみましょう。";
}
function renderNote(note) {
  $("reader-placeholder").hidden = true;
  $("reader-note").hidden = false;
  $("reader-title").textContent = note.title || "無題のメモ";
  $("reader-content").textContent = note.content || "本文はありません";
  $("reader-date").textContent = dateLabel(note.createdAt);
  $("reader-date").dateTime = note.createdAt || "";
  $("reader-id").textContent = `メモ #${note.id}`;
}
async function selectNote(id, focus = false) {
  selectedId = id;
  const request = ++detailRequest;
  renderList();
  $("reader").setAttribute("aria-busy", "true");
  $("reader-note").hidden = true;
  $("reader-placeholder").hidden = true;
  showError("detail-error", "");
  try {
    const note = await api(`/${encodeURIComponent(id)}`);
    if (request !== detailRequest) return;
    renderNote(note);
    if (focus) $("reader-title").focus({ preventScroll: !matchMedia("(max-width: 640px)").matches });
  } catch (error) {
    if (request === detailRequest) showError("detail-error", error.message);
  } finally {
    if (request === detailRequest) $("reader").setAttribute("aria-busy", "false");
  }
}
async function loadNotes() {
  const request = ++listRequest;
  $("note-list").setAttribute("aria-busy", "true");
  $("retry").disabled = true;
  showError("list-error", "");
  try {
    const data = await api();
    if (!Array.isArray(data)) throw new Error("一覧データを読み込めませんでした。");
    if (request !== listRequest) return;
    notes = data;
    renderList();
    const id = notes.some((note) => note.id === selectedId) ? selectedId : notes[0]?.id;
    if (id != null) await selectNote(id);
    else {
      selectedId = null;
      ++detailRequest;
      $("reader-note").hidden = true;
      $("reader-placeholder").hidden = false;
      $("reader").setAttribute("aria-busy", "false");
      showError("detail-error", "");
    }
  } catch (error) {
    if (request !== listRequest) return;
    showError("list-error", error.message);
    $("note-count").textContent = "一覧を読み込めませんでした";
  } finally {
    if (request === listRequest) {
      $("note-list").setAttribute("aria-busy", "false");
      $("retry").disabled = false;
    }
  }
}
function closeComposer() {
  if (saving) return;
  // Keep the draft when dismissed, including after a network failure.
  $("compose").close();
}
$("new-note").addEventListener("click", () => $("compose").showModal());
$("close-dialog").addEventListener("click", closeComposer);
$("cancel").addEventListener("click", closeComposer);
$("compose").addEventListener("cancel", (event) => { if (saving) event.preventDefault(); });
$("search").addEventListener("input", renderList);
$("retry").addEventListener("click", loadNotes);
$("retry-detail").addEventListener("click", () => selectNote(selectedId));
$("title").addEventListener("input", () => $("title").setCustomValidity(""));
$("content").addEventListener("input", () => { $("character-count").textContent = `${Array.from($("content").value).length}文字`; });
$("note-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (saving) return;
  const title = $("title").value.trim();
  if (!title) {
    $("title").setCustomValidity("タイトルを入力してください。");
    $("title").reportValidity();
    return;
  }
  saving = true;
  $("save-error").hidden = true;
  ["save", "cancel", "close-dialog", "title", "content"].forEach((id) => { $(id).disabled = true; });
  $("save").textContent = "保存中…";
  try {
    const note = await api("", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title, content: $("content").value }) });
    ++listRequest;
    ++detailRequest;
    notes = [note, ...notes.filter((item) => item.id !== note.id)];
    selectedId = note.id;
    $("search").value = "";
    showError("list-error", "");
    showError("detail-error", "");
    $("reader").setAttribute("aria-busy", "false");
    $("note-list").setAttribute("aria-busy", "false");
    $("retry").disabled = false;
    renderList();
    renderNote(note);
    $("note-form").reset();
    $("character-count").textContent = "0文字";
    $("compose").close();
    $("toast").textContent = "メモを保存しました";
    $("toast").hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { $("toast").hidden = true; }, 4000);
    // Refresh the full list after invalidating any pre-save list response.
    void loadNotes();
  } catch (error) {
    $("save-error").textContent = error.message;
    $("save-error").hidden = false;
  } finally {
    saving = false;
    ["save", "cancel", "close-dialog", "title", "content"].forEach((id) => { $(id).disabled = false; });
    $("save").textContent = "保存する";
  }
});
window.addEventListener("beforeunload", (event) => {
  if ($("title").value || $("content").value || saving) { event.preventDefault(); event.returnValue = ""; }
});
loadNotes();
