"use client";

import JSZip from "jszip";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { saveProject } from "@/lib/firestore";
import { useAuth } from "./providers/auth-provider";

type WorkspaceTab = "home" | "chat" | "builder" | "themes" | "ads" | "video" | "whatsapp" | "mobile-app";

type HistoryItem = {
  id: string;
  title: string;
  kind: string;
  createdAt: string;
};

type ManagedWebsite = {
  id: string;
  title: string;
  subdomainUrl: string;
  customDomain?: string;
  status: "deploying" | "live";
  deployedAt: string;
};

type PublishEvent = {
  id: string;
  label: string;
  state: "deploying" | "success";
  time: string;
  url?: string;
};

const sidebarItems = [
  { id: "home", label: "Home", icon: "⌂" },
  { id: "chat", label: "AI Chat", icon: "✦" },
  { id: "builder", label: "Website Builder", icon: "▣" },
  { id: "themes", label: "Shopify Themes", icon: "◈" },
  { id: "ads", label: "AI Ads Generator", icon: "◎" },
  { id: "video", label: "AI Video Generator", icon: "▶" },
  { id: "whatsapp", label: "WhatsApp Automation", icon: "✆" },
  { id: "mobile-app", label: "AI Mobile App Builder", icon: "◉" },
] as const;

export default function Home() {
  const { user, role, plan, isPro, isProPlus, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("home");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [chatPrompt, setChatPrompt] = useState("");
  const [chatLoading, setChatLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState("Aviron AI OS is ready. Ask me to build, market, or scale your brand.");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const [builderPrompt, setBuilderPrompt] = useState("");
  const [adsProductName, setAdsProductName] = useState("");
  const [adsProductDescription, setAdsProductDescription] = useState("");
  const [videoProductDetails, setVideoProductDetails] = useState("");
  const [themePrompt, setThemePrompt] = useState("");
  const [waProductImage, setWaProductImage] = useState<string | null>(null);
  const [waLogoImage, setWaLogoImage] = useState<string | null>(null);
  const [waProductName, setWaProductName] = useState("");
  const [waProductDetails, setWaProductDetails] = useState("");
  const [waSchedule, setWaSchedule] = useState("");
  const [waCampaignName, setWaCampaignName] = useState("");
  const [waLoading, setWaLoading] = useState(false);
  const [waMessages, setWaMessages] = useState<string[]>([
    "Hi! Welcome to Aviron Commerce. Need product recommendations?",
  ]);
  const [appIdeaPrompt, setAppIdeaPrompt] = useState("");
  const [appLoading, setAppLoading] = useState(false);
  const [appPreviewDevice, setAppPreviewDevice] = useState<"android" | "iphone">("android");
  const [appScreens, setAppScreens] = useState<string[]>([
    "Onboarding Carousel",
    "Login / Signup",
    "Home Feed",
    "Product Details",
  ]);
  const [appNavSystem, setAppNavSystem] = useState("Bottom Tabs + Stack Navigation");
  const [appUiSummary, setAppUiSummary] = useState("Starter ecommerce layout with modern card grid and sticky CTA.");
  const [appComponents, setAppComponents] = useState<string[]>([
    "Hero Banner",
    "Category Chips",
    "Product Card",
    "Cart Drawer",
    "Settings Toggle",
    "Profile Header",
  ]);
  const [lockedFeature, setLockedFeature] = useState<{ title: string; detail: string } | null>(null);
  const [imagePrompt, setImagePrompt] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [publishStatus, setPublishStatus] = useState<"idle" | "deploying" | "live">("idle");
  const [publishProgress, setPublishProgress] = useState(0);
  const [publishLoading, setPublishLoading] = useState(false);
  const [liveWebsiteUrl, setLiveWebsiteUrl] = useState("");
  const [customDomainInput, setCustomDomainInput] = useState("");
  const [publishSuccessOpen, setPublishSuccessOpen] = useState(false);
  const [managedSites, setManagedSites] = useState<ManagedWebsite[]>([]);
  const [publishEvents, setPublishEvents] = useState<PublishEvent[]>([]);

  const pushHistory = (title: string, kind: string) => {
    setHistory((prev) => [
      { id: crypto.randomUUID(), title, kind, createdAt: new Date().toISOString() },
      ...prev,
    ]);
  };

  const flashSuccess = (message: string) => {
    setSuccess(message);
    window.setTimeout(() => setSuccess(""), 2200);
  };

  const openUpgradePopup = (title: string, detail: string) => {
    setLockedFeature({ title, detail });
  };

  const simulateResponse = async (input: string) => {
    setChatLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 900));
    const response = `AI Strategy Ready:
- Product Angle: ${input}
- Creative Direction: premium dark glass + violet/blue gradients
- Action Plan: launch landing page, ad creatives, and short-form campaigns
- Next Step: generate deployable assets from Builder, Themes, Ads, and Video modules.`;
    setAiResponse(response);
    setChatLoading(false);
  };

  const onChatSubmit = async () => {
    if (!chatPrompt.trim()) return;
    setError("");
    await simulateResponse(chatPrompt.trim());
    pushHistory(chatPrompt.trim().slice(0, 60), "AI Chat");
    setChatPrompt("");
  };

  const onSaveProject = async (
    type: "website" | "ads" | "video-ads" | "shopify-theme" | "whatsapp-automation" | "mobile-app",
    title: string,
    prompt: string,
  ) => {
    if (!user) {
      setError("Login required for cloud sync.");
      return;
    }
    await saveProject({
      uid: user.uid,
      type,
      title,
      prompt,
      payload: prompt,
    });
  };

  const onGenerateWebsite = async () => {
    if (!builderPrompt.trim()) return;
    if (plan === "Free" && history.filter((h) => h.kind === "Website").length >= 3) {
      setError("Normal Users are limited to 3 website generations. Upgrade to Premium.");
      return;
    }
    await simulateResponse(`Website Builder: ${builderPrompt}`);
    await onSaveProject("website", "Generated Website Project", builderPrompt);
    pushHistory("Website Builder project generated", "Website");
    flashSuccess("Website project generated and synced");
  };

  const onGenerateAds = async () => {
    if (!adsProductName.trim() || !adsProductDescription.trim()) return;
    await simulateResponse(`Ads Pack for ${adsProductName}: ${adsProductDescription}`);
    if (plan === "Free") {
      pushHistory(`${adsProductName} ads preview generated`, "Ads Preview");
      flashSuccess("Ads preview generated (Free plan preview mode)");
      return;
    }
    await onSaveProject("ads", `${adsProductName} Ads Pack`, adsProductDescription);
    pushHistory(`${adsProductName} ads generated`, "Ads");
    flashSuccess("Ads pack generated and synced");
  };

  const onGenerateVideo = async () => {
    if (!videoProductDetails.trim()) return;
    await simulateResponse(`Video Ads Concepts: ${videoProductDetails}`);
    if (plan === "Free") {
      pushHistory("Video ads preview generated", "Video Preview");
      flashSuccess("Video preview generated (Free plan preview mode)");
      return;
    }
    await onSaveProject("video-ads", "Video Ads Concepts", videoProductDetails);
    pushHistory("Video ads concept generated", "Video");
    flashSuccess("Video ads concept generated and synced");
  };

  const onWhatsAppImageUpload = (file: File | null, target: "product" | "logo") => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    if (target === "product") setWaProductImage(url);
    else setWaLogoImage(url);
  };

  const onGenerateWhatsAppAutomation = async () => {
    if (!isProPlus) {
      openUpgradePopup("WhatsApp Automation", "Pro+ unlocks premium AI tools and business automation workflows.");
      return;
    }
    if (!waProductName.trim() || !waProductDetails.trim()) {
      setError("Enter WhatsApp automation product details first.");
      return;
    }
    setError("");
    setWaLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 950));

    const generated = [
      `AI Support Bot: Hi! ${waProductName} is currently in stock. Want details or checkout link?`,
      `Order Confirmation: Thanks for ordering ${waProductName}. Your order has been confirmed and dispatched.`,
      `Recommendation: Based on your interest, we recommend our premium bundle with ${waProductName}.`,
      `Abandoned Cart Recovery: Your ${waProductName} is still in cart. Complete checkout in 1 click.`,
      `Auto Reply: We got your message. A specialist will reply in 2 minutes.`,
      `Lead Collection: Share your name + city and we will send personalized offers.`,
    ];

    setWaMessages(generated);
    await onSaveProject(
      "whatsapp-automation",
      `${waCampaignName.trim() || waProductName.trim()} WhatsApp Campaign`,
      `${waProductName.trim()} | ${waProductDetails.trim()} | ${waSchedule || "Immediate launch"}`,
    );
    pushHistory(`WhatsApp automation launched for ${waProductName}`, "WhatsApp");
    setWaLoading(false);
    flashSuccess("WhatsApp AI automation assets generated and synced");
  };

  const onExportThemeZip = async () => {
    if (!isPro) {
      openUpgradePopup("Premium Templates", "Upgrade to Pro or Pro+ to export premium templates.");
      return;
    }
    if (!themePrompt.trim()) return;
    const zip = new JSZip();
    zip.file(
      "layout/theme.liquid",
      `<!doctype html><html><body><h1>${themePrompt}</h1>{{ content_for_layout }}</body></html>`,
    );
    zip.file("templates/index.liquid", "{% section 'hero' %}{% section 'collection-grid' %}");
    zip.file("sections/hero.liquid", "<section><h2>Luxury Hero</h2></section>");
    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = "aviron-shopify-theme.zip";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    await onSaveProject("shopify-theme", "Shopify Theme", themePrompt);
    pushHistory("Shopify theme exported", "Theme");
    flashSuccess("Theme ZIP exported and synced");
  };

  const onGenerateImage = async () => {
    if (!imagePrompt.trim()) return;
    setImageLoading(true);
    setError("");
    const output = `https://image.pollinations.ai/prompt/${encodeURIComponent(`${imagePrompt.trim()} cinematic mobile app marketing banner`)}`;
    setGeneratedImage(output);
    await new Promise((resolve) => setTimeout(resolve, 500));
    setImageLoading(false);
    pushHistory("AI image generated", "Image");
    flashSuccess("Image generated");
  };

  const onDownloadImage = () => {
    if (!generatedImage) return;
    const link = document.createElement("a");
    link.href = generatedImage;
    link.download = "aviron-generated-image.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const normalizeSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 24) || "aviron-site";

  const onPublishWebsite = async () => {
    const canPublish = isPro || isProPlus || isAdmin || role === "Super Admin";
    if (!canPublish) {
      openUpgradePopup("One-Click Publishing", "Pro or higher is required to publish websites.");
      return;
    }
    if (!builderPrompt.trim()) {
      setError("Generate a website draft first, then publish.");
      return;
    }

    setError("");
    setPublishStatus("deploying");
    setPublishLoading(true);
    setPublishProgress(5);

    const steps = [18, 33, 47, 63, 79, 92, 100];
    for (const step of steps) {
      await new Promise((resolve) => setTimeout(resolve, isProPlus ? 220 : 340));
      setPublishProgress(step);
    }

    const slug = normalizeSlug(builderPrompt.slice(0, 40));
    const token = Date.now().toString().slice(-6);
    const subdomainUrl = `https://${slug}-${token}.aviron.site`;

    setLiveWebsiteUrl(subdomainUrl);
    setManagedSites((prev) => [
      {
        id: crypto.randomUUID(),
        title: `${slug}.production`,
        subdomainUrl,
        status: "live",
        deployedAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setPublishEvents((prev) => [
      {
        id: crypto.randomUUID(),
        label: "One-click publish completed",
        state: "success",
        time: new Date().toISOString(),
        url: subdomainUrl,
      },
      ...prev,
    ]);
    setPublishStatus("live");
    setPublishLoading(false);
    setPublishSuccessOpen(true);
    pushHistory("Website published live", "Publish");
    flashSuccess("Website is live");
  };

  const onConnectCustomDomain = () => {
    const canPublish = isPro || isProPlus || isAdmin || role === "Super Admin";
    if (!canPublish) {
      openUpgradePopup("Custom Domain", "Custom domain connection is available on Pro and Pro+.");
      return;
    }
    if (!customDomainInput.trim()) {
      setError("Enter a custom domain first (example: yourbrand.com).");
      return;
    }
    if (!liveWebsiteUrl) {
      setError("Publish once to create a live deployment before linking domain.");
      return;
    }
    const nextDomain = customDomainInput.trim().toLowerCase();
    setManagedSites((prev) =>
      prev.map((site, idx) =>
        idx === 0
          ? {
              ...site,
              customDomain: nextDomain,
            }
          : site,
      ),
    );
    setPublishEvents((prev) => [
      {
        id: crypto.randomUUID(),
        label: `Custom domain connected: ${nextDomain}`,
        state: "success",
        time: new Date().toISOString(),
      },
      ...prev,
    ]);
    pushHistory("Custom domain connected", "Domain");
    flashSuccess("Custom domain connected successfully");
    setCustomDomainInput("");
  };

  const buildAppStructureZip = async (target: "react-native" | "flutter" | "apk-ready") => {
    if (!isPro && (target === "react-native" || target === "flutter")) {
      openUpgradePopup("Mobile Code Export", "Upgrade to Pro to export React Native and Flutter starter projects.");
      return;
    }
    if (!isProPlus && target === "apk-ready") {
      openUpgradePopup("APK-ready Export", "Pro+ unlocks APK-ready package structures and advanced hosting workflows.");
      return;
    }
    if (!appIdeaPrompt.trim()) {
      setError("Add an app idea prompt before export.");
      return;
    }

    const zip = new JSZip();
    const safeName = target.replace("-", "_");

    if (target === "react-native") {
      zip.file(
        "App.tsx",
        `import React from "react";
import { SafeAreaView, Text, View } from "react-native";

export default function App() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#0a0a0a", padding: 16 }}>
      <Text style={{ color: "#fff", fontSize: 24, fontWeight: "700" }}>Aviron App Builder Output</Text>
      <Text style={{ color: "#b3b3b3", marginTop: 10 }}>Prompt: ${appIdeaPrompt}</Text>
      <View style={{ marginTop: 14 }}>
        <Text style={{ color: "#d8b4fe" }}>Navigation: ${appNavSystem}</Text>
      </View>
    </SafeAreaView>
  );
}
`,
      );
      zip.file("src/screens/OnboardingScreen.tsx", "export const OnboardingScreen = () => null;");
      zip.file("src/screens/LoginScreen.tsx", "export const LoginScreen = () => null;");
      zip.file("src/screens/HomeScreen.tsx", "export const HomeScreen = () => null;");
      zip.file("src/screens/SettingsScreen.tsx", "export const SettingsScreen = () => null;");
    }

    if (target === "flutter") {
      zip.file(
        "lib/main.dart",
        `import 'package:flutter/material.dart';

void main() => runApp(const AvironApp());

class AvironApp extends StatelessWidget {
  const AvironApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Aviron App',
      theme: ThemeData.dark(),
      home: const Scaffold(
        body: Padding(
          padding: EdgeInsets.all(16),
          child: Text('Prompt: ${appIdeaPrompt}'),
        ),
      ),
    );
  }
}
`,
      );
      zip.file("lib/screens/onboarding_screen.dart", "class OnboardingScreen {}");
      zip.file("lib/screens/login_screen.dart", "class LoginScreen {}");
      zip.file("lib/screens/profile_screen.dart", "class ProfileScreen {}");
    }

    if (target === "apk-ready") {
      zip.file("android/app/src/main/AndroidManifest.xml", "<manifest package=\"com.aviron.generated\" />");
      zip.file(
        "README.md",
        `# APK-ready Structure

- Prompt: ${appIdeaPrompt}
- Navigation: ${appNavSystem}
- Screens: ${appScreens.join(", ")}
- Includes starter Android folders for rapid build pipeline setup.
`,
      );
      zip.file("android/gradle.properties", "org.gradle.jvmargs=-Xmx2048m");
      zip.file("android/settings.gradle", "rootProject.name = 'AvironGeneratedApp'");
    }

    const content = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(content);
    const link = document.createElement("a");
    link.href = url;
    link.download = `aviron-mobile-app-${safeName}.zip`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    flashSuccess(`${target} export downloaded`);
  };

  const onGenerateMobileApp = async () => {
    if (!appIdeaPrompt.trim()) return;
    setError("");
    setAppLoading(true);
    const delay = isProPlus ? 450 : isPro ? 700 : 1100;
    await new Promise((resolve) => setTimeout(resolve, delay));

    const base = appIdeaPrompt.trim();
    setAppUiSummary(`Premium mobile UI generated for: ${base}`);
    setAppNavSystem("Bottom Tabs + Nested Stack + Auth Guard");
    setAppScreens([
      "Onboarding Screens",
      "Login / Signup Pages",
      "Ecommerce Home Layout",
      "Product Listing + Product Details",
      "Settings Page",
      "Profile Page",
    ]);
    setAppComponents([
      "Gradient Hero",
      "Smart Search Bar",
      "Offer Carousel",
      "Category Grid",
      "Bottom Navigation",
      "Profile Stats Card",
      "Theme Switch",
      "Checkout CTA",
    ]);

    await onSaveProject("mobile-app", "AI Mobile App Builder", base);
    pushHistory("Mobile app builder package generated", "Mobile App");
    setAppLoading(false);
    flashSuccess("AI mobile app structure generated and synced");
  };

  const renderWorkspace = () => {
    if (activeTab === "home" || activeTab === "chat") {
      return (
        <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mx-auto max-w-3xl text-center">
            <p className="inline-flex rounded-full border border-blue-300/40 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-200">
              AI Operating System
            </p>
            <h1 className="mt-4 text-3xl font-bold sm:text-5xl">What should Aviron AI build for you?</h1>
            <p className="mt-3 text-sm text-zinc-300">
              Gemini + ChatGPT + Notion AI + Canva AI in one startup-grade operating layer.
            </p>
          </div>
          <div className="mx-auto mt-6 flex w-full max-w-3xl gap-2 rounded-2xl border border-white/15 bg-zinc-950/80 p-2">
            <input
              value={chatPrompt}
              onChange={(e) => setChatPrompt(e.target.value)}
              placeholder="Ask anything: launch strategy, website, ads, themes..."
              className="w-full bg-transparent px-3 py-2 text-sm outline-none"
            />
            <button
              type="button"
              onClick={onChatSubmit}
              disabled={chatLoading}
              className="rounded-xl bg-gradient-to-r from-white to-purple-200 px-4 py-2 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-70"
            >
              {chatLoading ? "Thinking..." : "Ask AI"}
            </button>
          </div>

          <div className="mx-auto mt-5 max-w-4xl rounded-2xl border border-purple-300/30 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.15em] text-purple-200">AI Response</p>
            <pre className={`mt-2 whitespace-pre-wrap text-sm leading-7 text-zinc-100 ${chatLoading ? "animate-pulse" : "animate-[fadeIn_.25s_ease]"}`}>
              {aiResponse}
            </pre>
          </div>

          <div className="mx-auto mt-5 max-w-4xl rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Free Plan Included: AI Image Generator</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,1fr)_auto_auto]">
              <input
                value={imagePrompt}
                onChange={(e) => setImagePrompt(e.target.value)}
                placeholder="Generate ad image, hero banner, or product creative..."
                className="rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={onGenerateImage}
                disabled={imageLoading}
                className="rounded-xl border border-purple-300/40 bg-purple-500/15 px-4 py-3 text-xs font-semibold text-purple-100"
              >
                {imageLoading ? "Generating..." : "Generate Image"}
              </button>
              <button
                type="button"
                onClick={onDownloadImage}
                disabled={!generatedImage}
                className="rounded-xl border border-blue-300/40 bg-blue-500/15 px-4 py-3 text-xs font-semibold text-blue-100 disabled:opacity-50"
              >
                Download Image
              </button>
            </div>
            {generatedImage ? (
              <div className="mt-3 overflow-hidden rounded-xl border border-white/10">
                <Image src={generatedImage} alt="Generated creative" width={1200} height={700} unoptimized className="h-52 w-full object-cover" />
              </div>
            ) : null}
          </div>
        </section>
      );
    }

    if (activeTab === "builder") {
      return (
        <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-semibold">Website Builder</h2>
              <p className="mt-2 text-sm text-zinc-300">Generate, deploy, and manage websites in one premium deployment flow.</p>
            </div>
            <span className="inline-flex rounded-full border border-emerald-300/35 bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-100">
              {publishStatus === "live" ? "Live Deployment Active" : publishStatus === "deploying" ? "Deploying..." : "Ready to Publish"}
            </span>
          </div>
          <textarea
            value={builderPrompt}
            onChange={(e) => setBuilderPrompt(e.target.value)}
            placeholder="Describe the website you want..."
            className="mt-4 h-36 w-full rounded-xl border border-white/15 bg-zinc-950/90 p-4 text-sm outline-none"
          />
          <button
            type="button"
            onClick={onGenerateWebsite}
            className="mt-3 rounded-xl bg-gradient-to-r from-white to-purple-200 px-5 py-3 text-sm font-semibold text-black"
          >
            Generate Website
          </button>

          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            <button
              type="button"
              onClick={() => void onPublishWebsite()}
              disabled={publishLoading}
              className="rounded-xl border border-emerald-300/35 bg-emerald-500/10 px-4 py-3 text-xs font-semibold text-emerald-100 transition disabled:opacity-60"
            >
              {publishLoading ? "Publishing..." : "Publish Website (One Click)"} {isPro || isProPlus || isAdmin ? "✓" : "🔒"}
            </button>
            <div className="rounded-xl border border-blue-300/35 bg-blue-500/10 p-2">
              <input
                value={customDomainInput}
                onChange={(e) => setCustomDomainInput(e.target.value)}
                placeholder="yourbrand.com"
                className="w-full rounded-lg border border-white/20 bg-zinc-950/80 px-3 py-2 text-xs outline-none"
              />
              <button
                type="button"
                onClick={onConnectCustomDomain}
                className="mt-2 w-full rounded-lg border border-blue-300/35 bg-blue-500/15 px-3 py-2 text-xs font-semibold text-blue-100"
              >
                Connect Custom Domain {isPro || isProPlus || isAdmin ? "✓" : "🔒"}
              </button>
            </div>
            <Link
              href="/deploy"
              className="rounded-xl border border-purple-300/35 bg-purple-500/10 px-4 py-3 text-center text-xs font-semibold text-purple-100"
            >
              Open Hosting Dashboard
            </Link>
          </div>

          <div className="mt-4 rounded-xl border border-white/10 bg-black/40 p-4">
            <div className="flex items-center justify-between text-xs text-zinc-300">
              <span>Deployment Progress</span>
              <span>{publishProgress}%</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
              <div
                className={`h-full rounded-full bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-500 transition-all duration-500 ${publishLoading ? "animate-pulse" : ""}`}
                style={{ width: `${publishProgress}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-zinc-400">
              {publishStatus === "deploying"
                ? "Preparing assets, provisioning CDN, and activating edge hosting..."
                : publishStatus === "live"
                  ? `Deployment complete: ${liveWebsiteUrl}`
                  : "No active deployment yet."}
            </p>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Website Management Panel</p>
              <div className="mt-3 space-y-2">
                {managedSites.length === 0 ? (
                  <p className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-zinc-400">No live websites yet. Use one-click publish to launch.</p>
                ) : (
                  managedSites.slice(0, 4).map((site) => (
                    <article key={site.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-semibold text-zinc-100">{site.title}</p>
                        <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-[10px] text-emerald-200">{site.status}</span>
                      </div>
                      <a href={site.subdomainUrl} target="_blank" rel="noreferrer" className="mt-1 block text-xs text-blue-200 underline">
                        {site.subdomainUrl}
                      </a>
                      <p className="mt-1 text-xs text-zinc-400">{site.customDomain ? `Custom domain: ${site.customDomain}` : "No custom domain connected"}</p>
                    </article>
                  ))
                )}
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Publish History</p>
              <div className="mt-3 space-y-2">
                {publishEvents.length === 0 ? (
                  <p className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-zinc-400">No publish events yet.</p>
                ) : (
                  publishEvents.slice(0, 6).map((event) => (
                    <article key={event.id} className="rounded-lg border border-white/10 bg-white/5 p-3">
                      <p className="text-xs text-zinc-200">{event.label}</p>
                      <p className="mt-1 text-[11px] text-zinc-500">{new Date(event.time).toLocaleTimeString()}</p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </div>
          <p className="mt-2 text-xs text-zinc-400">
            Free users can create previews only. Pro unlocks publish/deploy/domain features. Pro+ gets unlimited deployments and advanced hosting.
          </p>
        </section>
      );
    }

    if (activeTab === "themes") {
      if (!isPro) {
        return (
          <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">Shopify Themes</h2>
            <p className="mt-2 text-sm text-zinc-300">Premium templates are available on Pro and Pro+ plans.</p>
            <Link href="/pricing" className="mt-4 inline-flex rounded-xl border border-purple-300/35 bg-purple-500/15 px-4 py-2 text-sm text-purple-100">
              Upgrade Plan
            </Link>
          </section>
        );
      }
      return (
        <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold">Shopify Themes</h2>
          <p className="mt-2 text-sm text-zinc-300">Export Shopify-ready structure and assets.</p>
          <input
            value={themePrompt}
            onChange={(e) => setThemePrompt(e.target.value)}
            placeholder="Theme direction..."
            className="mt-4 w-full rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm outline-none"
          />
          <button
            type="button"
            onClick={onExportThemeZip}
            className="mt-3 rounded-xl border border-purple-300/45 bg-purple-500/10 px-5 py-3 text-sm font-semibold text-purple-100"
          >
            Export Shopify Theme ZIP
          </button>
        </section>
      );
    }

    if (activeTab === "ads") {
      return (
        <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
          <h2 className="text-2xl font-semibold">AI Ads Generator</h2>
          <p className="mt-1 text-xs text-zinc-400">
            {plan === "Free" ? "Free plan: preview generation only." : "Full generation + cloud sync unlocked."}
          </p>
          <div className="mt-4 grid gap-3">
            <input
              value={adsProductName}
              onChange={(e) => setAdsProductName(e.target.value)}
              placeholder="Product name"
              className="rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm outline-none"
            />
            <textarea
              value={adsProductDescription}
              onChange={(e) => setAdsProductDescription(e.target.value)}
              placeholder="Product description"
              className="h-28 rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm outline-none"
            />
          </div>
          <button
            type="button"
            onClick={onGenerateAds}
            className="mt-3 rounded-xl bg-gradient-to-r from-white to-purple-200 px-5 py-3 text-sm font-semibold text-black"
          >
            Generate Ads Pack
          </button>
        </section>
      );
    }

    if (activeTab === "whatsapp") {
      if (!isProPlus) {
        return (
          <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
            <h2 className="text-2xl font-semibold">AI WhatsApp Automation</h2>
            <p className="mt-2 text-sm text-zinc-300">Premium AI tools like WhatsApp automation are available on Pro+.</p>
            <Link href="/pricing" className="mt-4 inline-flex rounded-xl border border-purple-300/35 bg-purple-500/15 px-4 py-2 text-sm text-purple-100">
              Upgrade to Pro+
            </Link>
          </section>
        );
      }
      return (
        <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
          <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-purple-300/40 bg-purple-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-purple-200">
                AI WhatsApp Automation
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Customer support + sales automation</h2>
              <p className="mt-1 text-sm text-zinc-300">AI support bot, order flows, recommendations, cart recovery, auto-replies, leads, and campaigns.</p>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <label className="text-xs text-zinc-300">Campaign Name</label>
              <input
                value={waCampaignName}
                onChange={(e) => setWaCampaignName(e.target.value)}
                placeholder="Diwali Premium Drop Campaign"
                className="mt-1 w-full rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm outline-none"
              />
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <div>
                  <label className="text-xs text-zinc-300">Upload Product Image</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onWhatsAppImageUpload(e.target.files?.[0] || null, "product")}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-zinc-950/90 px-3 py-2 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs text-zinc-300">Upload Logo</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => onWhatsAppImageUpload(e.target.files?.[0] || null, "logo")}
                    className="mt-1 w-full rounded-xl border border-white/15 bg-zinc-950/90 px-3 py-2 text-xs"
                  />
                </div>
              </div>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                {waProductImage ? (
                  <Image
                    src={waProductImage}
                    alt="WA product"
                    width={320}
                    height={96}
                    unoptimized
                    className="h-24 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-24 rounded-xl aviron-shimmer" />
                )}
                {waLogoImage ? (
                  <Image
                    src={waLogoImage}
                    alt="WA logo"
                    width={320}
                    height={96}
                    unoptimized
                    className="h-24 w-full rounded-xl object-cover"
                  />
                ) : (
                  <div className="h-24 rounded-xl aviron-shimmer" />
                )}
              </div>
              <input
                value={waProductName}
                onChange={(e) => setWaProductName(e.target.value)}
                placeholder="Product name"
                className="mt-3 w-full rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm outline-none"
              />
              <textarea
                value={waProductDetails}
                onChange={(e) => setWaProductDetails(e.target.value)}
                placeholder="Product details"
                className="mt-3 h-24 w-full rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm outline-none"
              />
              <input
                type="datetime-local"
                value={waSchedule}
                onChange={(e) => setWaSchedule(e.target.value)}
                className="mt-3 w-full rounded-xl border border-white/15 bg-zinc-950/90 px-4 py-3 text-sm outline-none"
              />
              <button
                type="button"
                onClick={onGenerateWhatsAppAutomation}
                disabled={waLoading}
                className="mt-3 w-full rounded-xl bg-gradient-to-r from-white to-purple-200 px-4 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-70"
              >
                {waLoading ? "Generating Automation..." : "Generate WhatsApp AI Automation"}
              </button>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <div className="rounded-xl border border-white/10 bg-[#0b141a] p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-emerald-300">WhatsApp Chat Preview</p>
                <div className="mt-3 space-y-2">
                  {waLoading
                    ? Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-12 rounded-xl aviron-shimmer" />)
                    : waMessages.map((msg, idx) => (
                        <div
                          key={msg}
                          className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                            idx % 2 === 0
                              ? "mr-auto bg-zinc-800 text-zinc-100"
                              : "ml-auto bg-emerald-600/80 text-white"
                          }`}
                        >
                          {msg}
                        </div>
                      ))}
                </div>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-3">
                {[
                  { label: "Leads Collected", value: "1,284" },
                  { label: "Recovery Rate", value: "31.7%" },
                  { label: "Auto Reply SLA", value: "<2 min" },
                ].map((stat) => (
                  <article key={stat.label} className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                    <p className="text-xs text-zinc-400">{stat.label}</p>
                    <p className="mt-1 text-lg font-semibold text-purple-100">{stat.value}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>
      );
    }

    if (activeTab === "mobile-app") {
      return (
        <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="inline-flex rounded-full border border-blue-300/40 bg-blue-500/10 px-3 py-1 text-xs uppercase tracking-[0.18em] text-blue-200">
                AI Mobile App Builder
              </p>
              <h2 className="mt-3 text-2xl font-semibold">Build startup-grade mobile apps with AI</h2>
              <p className="mt-1 text-sm text-zinc-300">
                Generate app UI, screens, onboarding, auth, ecommerce layouts, and export starter code.
              </p>
              <p className="mt-1 text-xs text-zinc-400">
                Generation speed: {isProPlus ? "Priority (Pro+)" : isPro ? "Fast (Pro)" : "Standard (Free)"}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
              <label className="text-xs text-zinc-300">App idea prompt</label>
              <textarea
                value={appIdeaPrompt}
                onChange={(e) => setAppIdeaPrompt(e.target.value)}
                placeholder="Example: Build a premium fashion ecommerce app with onboarding, auth, product feed, cart, profile, and settings."
                className="mt-2 h-32 w-full rounded-xl border border-white/15 bg-zinc-950/90 p-4 text-sm outline-none"
              />
              <button
                type="button"
                onClick={onGenerateMobileApp}
                disabled={appLoading}
                className="mt-3 rounded-xl bg-gradient-to-r from-white to-purple-200 px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 disabled:opacity-70"
              >
                {appLoading ? "Generating Mobile App..." : "Generate Mobile App System"}
              </button>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <article className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Navigation System</p>
                  <p className="mt-2 text-sm text-purple-100">{appNavSystem}</p>
                </article>
                <article className="rounded-xl border border-white/10 bg-white/5 p-3">
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Generated UI</p>
                  <p className="mt-2 text-sm text-zinc-200">{appUiSummary}</p>
                </article>
              </div>

              <div className="mt-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Generated App Screens</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {appScreens.map((screen) => (
                    <div key={screen} className="rounded-lg border border-white/10 bg-zinc-900/70 px-3 py-2 text-xs text-zinc-100">
                      {screen}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <div className="mb-3 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAppPreviewDevice("android")}
                    className={`rounded-lg border px-3 py-1 text-xs transition ${appPreviewDevice === "android" ? "border-purple-300/40 bg-purple-500/15 text-purple-100" : "border-white/15 bg-white/5 text-zinc-300"}`}
                  >
                    Android Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setAppPreviewDevice("iphone")}
                    className={`rounded-lg border px-3 py-1 text-xs transition ${appPreviewDevice === "iphone" ? "border-blue-300/40 bg-blue-500/15 text-blue-100" : "border-white/15 bg-white/5 text-zinc-300"}`}
                  >
                    iPhone Preview
                  </button>
                </div>

                <div className={`mx-auto h-[420px] w-[220px] rounded-[2.2rem] border p-3 ${appPreviewDevice === "android" ? "border-emerald-300/30 bg-emerald-500/5" : "border-blue-300/30 bg-blue-500/5"}`}>
                  <div className="flex h-full flex-col rounded-[1.6rem] border border-white/10 bg-zinc-950/90 p-3">
                    <p className="text-xs text-zinc-400">{appPreviewDevice === "android" ? "Android simulator" : "iPhone simulator"}</p>
                    <div className="mt-3 space-y-2">
                      {appLoading ? (
                        Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-8 rounded-lg aviron-shimmer" />)
                      ) : (
                        <>
                          <div className="h-8 rounded-lg bg-purple-500/20" />
                          <div className="h-16 rounded-lg bg-white/10" />
                          <div className="grid grid-cols-2 gap-2">
                            <div className="h-16 rounded-lg bg-white/10" />
                            <div className="h-16 rounded-lg bg-white/10" />
                          </div>
                          <div className="h-20 rounded-lg bg-blue-500/20" />
                          <div className="mt-auto h-10 rounded-full border border-white/20 bg-white/5" />
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">App Components Library</p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {appComponents.map((component) => (
                    <div key={component} className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-xs text-zinc-200">
                      {component}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">Export Options</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void buildAppStructureZip("react-native")}
                className="rounded-lg border border-purple-300/35 bg-purple-500/10 px-3 py-2 text-xs text-purple-100 transition hover:bg-purple-500/20"
              >
                Export React Native {isPro ? "" : "🔒"}
              </button>
              <button
                type="button"
                onClick={() => void buildAppStructureZip("flutter")}
                className="rounded-lg border border-blue-300/35 bg-blue-500/10 px-3 py-2 text-xs text-blue-100 transition hover:bg-blue-500/20"
              >
                Export Flutter {isPro ? "" : "🔒"}
              </button>
              <button
                type="button"
                onClick={() => void buildAppStructureZip("apk-ready")}
                className="rounded-lg border border-emerald-300/35 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100 transition hover:bg-emerald-500/20"
              >
                Export APK-ready Structure {isProPlus ? "" : "🔒"}
              </button>
            </div>
          </div>
        </section>
      );
    }

    return (
      <section className="rounded-3xl border border-white/15 bg-white/5 p-6 backdrop-blur-xl">
        <h2 className="text-2xl font-semibold">AI Video Generator</h2>
        <p className="mt-1 text-xs text-zinc-400">
          {plan === "Free" ? "Free plan: preview generation only." : "Full save + deployment-ready strategy unlocked."}
        </p>
        <textarea
          value={videoProductDetails}
          onChange={(e) => setVideoProductDetails(e.target.value)}
          placeholder="Video ad concept and product details..."
          className="mt-4 h-32 w-full rounded-xl border border-white/15 bg-zinc-950/90 p-4 text-sm outline-none"
        />
        <button
          type="button"
          onClick={onGenerateVideo}
          className="mt-3 rounded-xl bg-gradient-to-r from-white to-purple-200 px-5 py-3 text-sm font-semibold text-black"
        >
          Generate Video Concepts
        </button>
      </section>
    );
  };

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.17),transparent_45%),radial-gradient(circle_at_20%_30%,rgba(139,92,246,0.22),transparent_38%)]" />

      <header className="sticky top-0 z-30 border-b border-white/10 bg-black/50 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen((v) => !v)}
              className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-sm lg:hidden"
            >
              Menu
            </button>
            <p className="text-sm font-semibold tracking-wide text-purple-200">Aviron AI OS</p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/pricing" className="rounded-lg border border-white/15 bg-white/5 px-3 py-1 text-xs">Pricing</Link>
            <Link href="/dashboard" className="rounded-lg border border-purple-300/35 bg-purple-500/15 px-3 py-1 text-xs text-purple-100">Dashboard</Link>
            {isAdmin ? (
              <Link href="/admin" className="rounded-lg border border-blue-300/35 bg-blue-500/15 px-3 py-1 text-xs text-blue-100">Admin</Link>
            ) : null}
            <div className="rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs text-zinc-200">
              {user?.email || "Guest"}
            </div>
            <div className="rounded-full border border-purple-300/40 bg-purple-500/15 px-3 py-1 text-xs text-purple-100">
              {role} • {plan}
            </div>
          </div>
        </div>
      </header>

      <div className="mx-auto flex max-w-[1400px] gap-4 px-4 py-4 sm:px-6">
        <aside
          className={`fixed inset-y-0 left-0 z-40 w-72 transform border-r border-white/10 bg-zinc-950/95 p-4 backdrop-blur-xl transition lg:static lg:translate-x-0 lg:rounded-2xl lg:border ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <div className="mb-4 flex items-center justify-between lg:justify-start">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-purple-200">Navigation</h2>
            <button type="button" onClick={() => setSidebarOpen(false)} className="rounded-md border border-white/20 px-2 py-1 text-xs lg:hidden">
              Close
            </button>
          </div>
          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-sm transition ${
                    active
                      ? "border-purple-300/45 bg-purple-500/20 text-purple-100"
                      : "border-white/10 bg-white/5 text-zinc-200 hover:border-purple-300/30"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              );
            })}
            <Link href="/dashboard" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
              <span>◉</span>
              <span>Dashboard</span>
            </Link>
            {isAdmin ? (
              <Link href="/admin" className="flex items-center gap-3 rounded-xl border border-blue-300/35 bg-blue-500/10 px-3 py-2 text-sm text-blue-100">
                <span>⌘</span>
                <span>Admin</span>
              </Link>
            ) : null}
            <Link href="/pricing" className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
              <span>$</span>
              <span>Pricing</span>
            </Link>
            <Link href="/deploy" className="flex items-center gap-3 rounded-xl border border-emerald-300/35 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-100">
              <span>⇪</span>
              <span>Deploy</span>
            </Link>
            <Link href="/domains" className="flex items-center gap-3 rounded-xl border border-blue-300/35 bg-blue-500/10 px-3 py-2 text-sm text-blue-100">
              <span>◎</span>
              <span>Domains</span>
            </Link>
            <button type="button" className="flex w-full items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-zinc-200">
              <span>⚙</span>
              <span>Settings</span>
            </button>
          </nav>
        </aside>

        <div className="min-w-0 flex-1">
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: "Model Uptime", value: "99.99%" },
                  { title: "Tasks Generated", value: "148K+" },
                  { title: "Creative Output", value: "52K+" },
                  { title: "Automation Score", value: "A+" },
                ].map((card) => (
                  <article key={card.title} className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
                    <p className="text-xs uppercase tracking-[0.14em] text-zinc-400">{card.title}</p>
                    <p className="mt-2 text-2xl font-semibold">{card.value}</p>
                  </article>
                ))}
              </section>

              {renderWorkspace()}

              <section className="rounded-3xl border border-white/15 bg-white/5 p-5 backdrop-blur-xl">
                <h3 className="text-lg font-semibold">AI Tools</h3>
                <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {[
                    ["Website Builder", "Generate complete modern websites"],
                    ["Theme Engine", "Export Shopify theme packs"],
                    ["Ads Studio", "Launch high-converting ad sets"],
                    ["Video Lab", "Create short-form video strategies"],
                    ["WhatsApp AI", "Automate support, sales, and campaigns"],
                    ["Mobile App Builder", "Generate app UI, screens, and mobile starter exports"],
                  ].map(([title, copy]) => (
                    <article key={title} className="rounded-xl border border-white/10 bg-black/40 p-4 transition hover:-translate-y-0.5 hover:border-purple-300/40">
                      <p className="font-semibold text-purple-100">{title}</p>
                      <p className="mt-2 text-xs text-zinc-300">{copy}</p>
                    </article>
                  ))}
                </div>
              </section>

              {error ? <p className="rounded-xl border border-red-300/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">{error}</p> : null}
              {success ? <p className="rounded-xl border border-emerald-300/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">{success}</p> : null}
            </div>

            <aside className="rounded-3xl border border-white/15 bg-white/5 p-4 backdrop-blur-xl">
              <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-purple-200">Profile</h3>
              <div className="mt-3 rounded-xl border border-white/10 bg-black/40 p-3">
                <p className="text-sm font-semibold">{user?.displayName || "Aviron User"}</p>
                <p className="mt-1 text-xs text-zinc-300">{user?.email || "Sign in for cloud sync"}</p>
              </div>

              <h3 className="mt-6 text-sm font-semibold uppercase tracking-[0.16em] text-purple-200">Recent History</h3>
              <div className="mt-3 space-y-2">
                {history.length === 0 ? (
                  <p className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-zinc-400">No actions yet. Run a generator to create history.</p>
                ) : (
                  history.slice(0, 8).map((item) => (
                    <article key={item.id} className="rounded-xl border border-white/10 bg-black/30 p-3">
                      <p className="text-xs uppercase tracking-[0.12em] text-purple-200">{item.kind}</p>
                      <p className="mt-1 text-sm text-zinc-100">{item.title}</p>
                      <p className="mt-1 text-xs text-zinc-400">{new Date(item.createdAt).toLocaleTimeString()}</p>
                    </article>
                  ))
                )}
              </div>
            </aside>
          </div>
        </div>
      </div>

      {lockedFeature ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-purple-300/40 bg-zinc-950 p-6 shadow-[0_0_60px_rgba(139,92,246,0.3)]">
            <p className="text-xs uppercase tracking-[0.16em] text-purple-200">Feature Locked</p>
            <h3 className="mt-2 text-xl font-semibold">{lockedFeature.title}</h3>
            <p className="mt-2 text-sm text-zinc-300">{lockedFeature.detail}</p>
            <div className="mt-5 flex gap-2">
              <Link href="/pricing" className="rounded-lg bg-gradient-to-r from-white to-purple-200 px-4 py-2 text-sm font-semibold text-black">
                Upgrade Plan
              </Link>
              <button
                type="button"
                onClick={() => setLockedFeature(null)}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-zinc-100"
              >
                Maybe later
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {publishSuccessOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-emerald-300/40 bg-zinc-950 p-6 shadow-[0_0_80px_rgba(16,185,129,0.32)] animate-[fadeIn_.2s_ease]">
            <p className="text-xs uppercase tracking-[0.16em] text-emerald-200">Deployment Successful</p>
            <h3 className="mt-2 text-2xl font-semibold">Website is now live</h3>
            <p className="mt-2 text-sm text-zinc-300">Your one-click publish completed with edge hosting, SSL, and global CDN.</p>
            <a
              href={liveWebsiteUrl}
              target="_blank"
              rel="noreferrer"
              className="mt-4 block rounded-xl border border-emerald-300/35 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100"
            >
              {liveWebsiteUrl}
            </a>
            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={() => setPublishSuccessOpen(false)}
                className="rounded-lg border border-white/20 bg-white/5 px-4 py-2 text-sm text-zinc-100"
              >
                Close
              </button>
              <Link href="/deploy" className="rounded-lg bg-gradient-to-r from-white to-emerald-200 px-4 py-2 text-sm font-semibold text-black">
                Manage Hosting
              </Link>
            </div>
          </div>
        </div>
      ) : null}
    </main>
  );
}