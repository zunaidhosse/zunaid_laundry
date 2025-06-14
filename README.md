# Zunaid Laundry - Progressive Web App (PWA)

এই প্রজেক্টটি একটি প্রগ্রেসিভ ওয়েব অ্যাপ (PWA) যা অফলাইনে কাজ করতে পারে এবং ব্যবহারকারীরা তাদের ডিভাইসে ইনস্টল করতে পারে।

This project is a Progressive Web App (PWA) that can work offline and can be installed by users on their devices.

---

## কিভাবে GitHub Pages এ হোস্ট করবেন (How to Host on GitHub Pages)

আপনার অ্যাপটি লাইভ করার জন্য নিচের ধাপগুলো অনুসরণ করুন।

Follow these steps to make your app live.

### ধাপ ১: একটি নতুন GitHub রিপোজিটরি তৈরি করুন (Step 1: Create a new GitHub Repository)

1.  আপনার GitHub অ্যাকাউন্টে লগইন করুন।
2.  উপরে ডানদিকে "+" আইকনে ক্লিক করুন এবং "New repository" নির্বাচন করুন।
3.  আপনার রিপোজিটরির একটি নাম দিন (যেমন: `laundry-app`)।
4.  "Create repository" বাটনে ক্লিক করুন।

### ধাপ ২: প্রজেক্টের সমস্ত ফাইল আপলোড করুন (Step 2: Upload all Project Files)

আপনার কম্পিউটারে থাকা প্রজেক্টের সমস্ত ফাইল এই নতুন রিপোজিটরিতে আপলোড করতে হবে।

You need to upload all the project files from your computer to this new repository.

1.  আপনার নতুন তৈরি করা রিপোজিটরিতে যান।
2.  "Add file" ড্রপডাউনে ক্লিক করুন এবং "Upload files" নির্বাচন করুন।
3.  আপনার প্রজেক্ট ফোল্ডার থেকে নিচের সব ফাইলগুলো একসাথে টেনে এনে আপলোড করুন:
    *   `index.html`
    *   `style.css`
    *   `manifest.json`
    *   `service-worker.js`
    *   `script.js`
    *   `main.js`
    *   `config.js`
    *   `dom.js`
    *   `events.js`
    *   `state.js`
    *   `ui.js`
    *   `translations.js`
    *   এবং সমস্ত ছবির ফাইল (`.png` files)

4.  ফাইলগুলো আপলোড হয়ে গেলে, "Commit changes" বাটনে ক্লিক করুন।

### ধাপ ৩: GitHub Pages চালু করুন (Step 3: Enable GitHub Pages)

1.  আপনার রিপোজিটরির প্রধান পেজ থেকে "Settings" ট্যাবে ক্লিক করুন।
2.  বাম পাশের মেনু থেকে "Pages" এ ক্লিক করুন।
3.  "Build and deployment" সেকশনের নিচে "Source" এ, ড্রপডাউন থেকে "Deploy from a branch" নির্বাচন করুন।
4.  "Branch" সেকশনের নিচে, আপনার main branch নির্বাচন করুন (সাধারণত `main` বা `master`)। ফোল্ডার `/ (root)` নির্বাচন করুন এবং "Save" বাটনে ক্লিক করুন।

কিছুক্ষণের মধ্যেই আপনার সাইটটি পাবলিশ হয়ে যাবে। আপনি পেজের উপরে একটি সবুজ বার্তা দেখতে পাবেন যেখানে আপনার লাইভ ওয়েবসাইটের লিঙ্ক দেওয়া থাকবে। লিঙ্কটি সাধারণত এই ফরম্যাটে হবে: `https://zunaidhosse.github.io/zunaid_laundry/`

It might take a few minutes for your site to be published. You will see a green message at the top of the page with the link to your live website. The link will typically be in this format: `https://zunaidhosse.github.io/zunaid_laundry/`

---

### অ্যাপটি কিভাবে কাজ করে (How the App Works)

আপনার অনুরোধ অনুযায়ী অ্যাপটিতে এই বৈশিষ্ট্যগুলো আগে থেকেই তৈরি করা আছে:

The features you requested are already built into this application:

*   **ইনস্টলেশন (Installation):** ব্যবহারকারী যখন প্রথমবার আপনার সাইটে ভিজিট করবে, তখন একটি "Install App" বাটন দেখা যাবে। এটিতে ক্লিক করলে অ্যাপটি তাদের মোবাইলে বা কম্পিউটারে ইনস্টল হয়ে যাবে। এই কাজটি `main.js` ফাইলের `beforeinstallprompt` ইভেন্ট দ্বারা নিয়ন্ত্রিত হয়।
*   **অফলাইন ব্যবহার (Offline Use):** `service-worker.js` ফাইলটি অ্যাপের সব প্রয়োজনীয় ফাইল (HTML, CSS, JS, ছবি) ক্যাশে সংরক্ষণ করে। এর ফলে, ইন্টারনেট সংযোগ না থাকলেও অ্যাপটি সম্পূর্ণভাবে কাজ করে। `fetch` ইভেন্ট প্রথমে ক্যাশে ফাইল খোঁজে এবং না পেলে নেটওয়ার্ক থেকে আনার চেষ্টা করে।

