// ReelReview demo app.js (GitHub Pages friendly)
// - Demo login via localStorage
// - Credits-based uploads (hosted links)
// - Review queue with tier-based pay

function $(id){ return document.getElementById(id); }

// ===== Auth =====
function login(){
  const email = $("email") ? $("email").value.trim() : "";
  if(!email){ alert("Enter email"); return; }
  localStorage.setItem("user", email);
  // initialize defaults once
  if(!localStorage.getItem("creatorCredits")) localStorage.setItem("creatorCredits","250");
  if(!localStorage.getItem("earnings")) localStorage.setItem("earnings","0");
  if(!localStorage.getItem("uploads")) localStorage.setItem("uploads","[]");
  if(!localStorage.getItem("reviews")) localStorage.setItem("reviews","[]");
  location.href = "./dashboard.html";
}

function logout(){
  localStorage.removeItem("user");
  location.href = "./login.html";
}

(function protect(){
  if(location.pathname.endsWith("/dashboard.html") || location.pathname.endsWith("dashboard.html")){
    if(!localStorage.getItem("user")){
      location.href = "./login.html";
    }
  }
})();

// ===== Pricing / Tiers =====
const TIER_MAP = {
  short:    { label: "Short (≤ 1 min)",                creditsPerReview: 1,  reviewerPay: 0.30 },
  standard: { label: "Standard (≤ 5 min)",             creditsPerReview: 2,  reviewerPay: 0.50 },
  long:     { label: "Long (≤ 30 min)",                creditsPerReview: 4,  reviewerPay: 0.90 },
  feature:  { label: "Feature (≤ 60 min)",             creditsPerReview: 8,  reviewerPay: 1.75 },
  full:     { label: "Full Movie (≤ 150 min / 2.5h)",  creditsPerReview: 12, reviewerPay: 2.50 }
};

function getTier(){
  const sel = $("lengthTier");
  const v = sel ? sel.value : "standard";
  return TIER_MAP[v] ? v : "standard";
}

function getCreatorCredits(){ return parseInt(localStorage.getItem("creatorCredits") || "0", 10); }
function setCreatorCredits(n){ localStorage.setItem("creatorCredits", String(Math.max(0, n))); }

function getUploads(){ return JSON.parse(localStorage.getItem("uploads") || "[]"); }
function setUploads(list){ localStorage.setItem("uploads", JSON.stringify(list || [])); }

function getReviews(){ return JSON.parse(localStorage.getItem("reviews") || "[]"); }
function setReviews(list){ localStorage.setItem("reviews", JSON.stringify(list || [])); }

// ===== Dashboard UI helpers =====
function setDashboardUI(){
  const cc = $("creditsCount"); if(cc) cc.innerText = String(getCreatorCredits());
  const c2 = $("creatorCredits"); if(c2) c2.innerText = String(getCreatorCredits());
  const e = parseFloat(localStorage.getItem("earnings") || "0");
  const ec = $("earningsCount"); if(ec) ec.innerText = "$" + e.toFixed(2);
}

function escapeHTML(s){
  return (s||"").replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function renderUploads(){
  const box = $("uploadsList");
  if(!box) return;
  const uploads = getUploads().slice().reverse();
  if(uploads.length === 0){
    box.innerHTML = '<div class="item">No uploads yet.</div>';
    return;
  }
  box.innerHTML = uploads.map(u => {
    const done = (u.completedReviews||0);
    const total = (u.requestedReviews||0);
    const pct = total ? Math.round((done/total)*100) : 0;
    return \`
      <div class="item">
        <div style="font-weight:900;">\${escapeHTML(u.title)} <span class="mini">(\${escapeHTML(u.tierLabel||"Standard")})</span></div>
        <div class="mini">Requested: <strong>\${total}</strong> · Completed: <strong>\${done}</strong> · \${pct}%</div>
        <div class="mini">Cost: <strong>\${u.costCredits||0}</strong> credits · Pay: <strong>$\${Number(u.reviewerPay||0.5).toFixed(2)}</strong>/review</div>
        <div class="mini">Hosted: \${escapeHTML((u.hostedURL||"").slice(0,90))}\${(u.hostedURL||"").length>90?"…":""}</div>
      </div>\`;
  }).join("");
}

function renderHistory(){
  const box = $("historyList");
  if(!box) return;
  const reviews = getReviews().slice().reverse().slice(0,6);
  if(reviews.length === 0){
    box.innerHTML = '<div class="item">No reviews yet.</div>';
    return;
  }
  box.innerHTML = reviews.map(r => \`
    <div class="item">
      <div style="font-weight:850;">\${escapeHTML(r.videoTitle || "Video")} — \${escapeHTML(r.rating||"")}</div>
      <div class="mini">Earned: <strong>$\${Number(r.reviewerPay||0).toFixed(2)}</strong> · \${escapeHTML(r.date||"")}</div>
    </div>\`
  ).join("");
}

// ===== Upload Modal =====
function openUpload(){
  const m = $("uploadModal"); if(m) m.classList.add("show");
  const a = $("uploadCreditsAvail"); if(a) a.innerText = String(getCreatorCredits());
  const rr = $("requestedReviews");
  if(rr){ rr.oninput = refreshUploadCost; }
  refreshUploadCost();
}

function closeUpload(){
  const m = $("uploadModal"); if(m) m.classList.remove("show");
  if($("title")) $("title").value = "";
  if($("description")) $("description").value = "";
  if($("videoURL")) $("videoURL").value = "";
  if($("requestedReviews")) $("requestedReviews").value = 10;
  if($("lengthTier")) $("lengthTier").value = "standard";
  refreshUploadCost();
}

function refreshUploadCost(){
  const rr = $("requestedReviews");
  const n = rr ? Math.max(1, parseInt(rr.value || "1", 10)) : 10;
  const tier = TIER_MAP[getTier()];
  const cost = n * tier.creditsPerReview;
  if($("uploadCostCredits")) $("uploadCostCredits").innerText = String(cost);
}

function submitVideo(){
  const title = $("title") ? $("title").value.trim() : "";
  const desc = $("description") ? $("description").value.trim() : "";
  const hostedURL = $("videoURL") ? $("videoURL").value.trim() : "";
  const requestedReviews = $("requestedReviews") ? Math.max(1, parseInt($("requestedReviews").value || "1", 10)) : 10;

  if(!title) return alert("Add a movie title.");
  if(!hostedURL) return alert("Paste a hosted video link (required).\n\nExamples: YouTube (unlisted), Vimeo, Drive, Dropbox, or direct .mp4.");

  const tierKey = getTier();
  const tier = TIER_MAP[tierKey];
  const costCredits = requestedReviews * tier.creditsPerReview;

  const credits = getCreatorCredits();
  if(credits < costCredits){
    return alert(\`Not enough credits.\n\nTier: \${tier.label}\nRequested reviews: \${requestedReviews}\nCost: \${costCredits} credits\nYou have: \${credits} credits\n\nUse Buy Credits.\`);
  }

  setCreatorCredits(credits - costCredits);

  const upload = {
    id: Date.now(),
    title,
    description: desc,
    hostedURL,
    tierKey,
    tierLabel: tier.label,
    creditsPerReview: tier.creditsPerReview,
    reviewerPay: tier.reviewerPay,
    requestedReviews,
    costCredits,
    completedReviews: 0,
    createdAt: new Date().toLocaleString()
  };
  const uploads = getUploads();
  uploads.push(upload);
  setUploads(uploads);

  // Queue item: if direct playable, set src; else use demo player and provide Open Hosted Link button.
  const directPlayable = /\.(mp4|webm|ogg|m3u8)(\?|#|$)/i.test(hostedURL);
  const src = directPlayable ? hostedURL : "https://www.w3schools.com/html/mov_bbb.mp4";
  demoVideos.push({
    title: "Creator Upload: " + title,
    src,
    hostedURL,
    uploadId: upload.id,
    tierKey,
    reviewerPay: tier.reviewerPay
  });

  alert(\`Upload submitted ✅\n\nTier: \${tier.label}\nRequested: \${requestedReviews}\nCost: \${costCredits} credits\nRemaining: \${getCreatorCredits()}\n\nHosted URL saved for reviewers.\`);
  closeUpload();
  setDashboardUI();
  renderUploads();
  renderHistory();
}

// ===== Review Queue =====
let earnings = parseFloat(localStorage.getItem("earnings") || "0");

const demoVideos = [
  { title: "Indie Short Film (Demo)", src: "https://www.w3schools.com/html/mov_bbb.mp4", hostedURL: "", reviewerPay: 0.50 }
];

let queueIndex = 0;

function openQueue(){
  const m = $("queueModal"); if(m) m.classList.add("show");
  loadQueueItem();
}

function closeQueue(){
  const m = $("queueModal"); if(m) m.classList.remove("show");
  if($("reviewText")) $("reviewText").value = "";
  if($("rating")) $("rating").value = "";
  if($("queueVideo")) $("queueVideo").pause();
}

function loadQueueItem(){
  const v = demoVideos[queueIndex] || demoVideos[0];
  const pay = (typeof v.reviewerPay === "number") ? v.reviewerPay : 0.50;
  if($("queueTitle")) $("queueTitle").innerText = v.title + \` · Pays $\${pay.toFixed(2)}\`;
  if($("queueVideo")){
    $("queueVideo").src = v.src;
  }
}

function nextQueueItem(){
  queueIndex = (queueIndex + 1) % demoVideos.length;
  if($("reviewText")) $("reviewText").value = "";
  if($("rating")) $("rating").value = "";
  loadQueueItem();
}

function openHostedLink(){
  const v = demoVideos[queueIndex];
  if(!v || !v.hostedURL) return alert("No hosted link attached to this item.");
  window.open(v.hostedURL, "_blank");
}

function submitReview(){
  const text = $("reviewText") ? $("reviewText").value.trim() : "";
  const rating = $("rating") ? $("rating").value : "";
  if(!rating) return alert("Please select a rating.");
  if(text.split(/\s+/).filter(Boolean).length < 50) return alert("Review must be at least 50 words.");

  const v = demoVideos[queueIndex];
  const pay = (typeof v.reviewerPay === "number") ? v.reviewerPay : 0.50;

  const review = {
    id: String(Date.now()),
    videoTitle: v.title,
    rating,
    text,
    date: new Date().toLocaleString(),
    uploadId: v.uploadId || null,
    reviewerPay: pay
  };

  const list = getReviews();
  list.push(review);
  setReviews(list);

  // increment upload completion count
  if(v.uploadId){
    const uploads = getUploads();
    const u = uploads.find(x => x.id === v.uploadId);
    if(u){
      u.completedReviews = (u.completedReviews || 0) + 1;
      setUploads(uploads);
    }
  }

  earnings += pay;
  localStorage.setItem("earnings", earnings.toString());

  setDashboardUI();
  renderUploads();
  renderHistory();

  alert(\`Review submitted! +$\${pay.toFixed(2)} earned 💰\`);
  nextQueueItem();
}

// ===== Checkout placeholders =====
function openCheckout(type){
  const m = $("checkoutModal"); if(m) m.classList.add("show");
  if($("checkoutTitle")) $("checkoutTitle").innerText = type === "boost" ? "Priority Boost Checkout" : "Buy Credits Checkout";
  if($("stripePlaceholder")) $("stripePlaceholder").innerText =
    type === "boost" ? "https://buy.stripe.com/YOUR_PRIORITY_BOOST_LINK" : "https://buy.stripe.com/YOUR_CREDITS_LINK";
}
function closeCheckout(){
  const m = $("checkoutModal"); if(m) m.classList.remove("show");
}
function openPricing(){
  // placeholder until pricing page exists; you can add pricing.html later
  alert("Pricing is inside your dashboard cards right now. Add pricing.html later if you want a separate page.");
}

// Close on backdrop click
function modalBackdropClose(e, id){
  const m = $(id);
  if(m && e.target === m){
    m.classList.remove("show");
  }
}

// Boot dashboard UI on load
window.addEventListener("DOMContentLoaded", () => {
  if(location.pathname.endsWith("/dashboard.html") || location.pathname.endsWith("dashboard.html")){
    setDashboardUI();
    renderUploads();
    renderHistory();
  }
});
