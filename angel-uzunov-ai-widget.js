(() => {
  "use strict";

  /*
   * ============================================================
   * ANGEL UZUNOV — PERSONAL AI WIDGET
   * Website: angeluzunov.site
   * Assistant: Alex
   * Backend: AI Business Agent
   * ============================================================
   */

  const script =
    document.currentScript ||
    document.querySelector(
      'script[src*="angel-uzunov-ai-widget.js"]'
    );

  if (!script) {
    console.error(
      "[Angel Uzunov AI] Widget script not found."
    );
    return;
  }

  /*
   * ============================================================
   * CONFIGURATION
   * ============================================================
   */

  const widgetKey =
    (
      script.dataset.widgetKey ||
      "1db7c3f5-125c-4f52-ba5e-632ebe1d1829"
    ).trim();

  const apiBase =
    (
      script.dataset.apiBase ||
      "https://ai-business-agent-nine.vercel.app"
    ).replace(/\/$/, "");

  const agentName =
    (
      script.dataset.agentName ||
      "Alex"
    ).trim();

  const businessName =
    (
      script.dataset.businessName ||
      "Angel Uzunov"
    ).trim();

  const welcomeMessage =
    (
      script.dataset.welcomeMessage ||
      "Здравейте! Аз съм Alex. Как мога да ви помогна?"
    ).trim();

  const position =
    (
      script.dataset.position ||
      "bottom-right"
    ).trim();

  const primaryColor =
    (
      script.dataset.primaryColor ||
      "#d8b66a"
    ).trim();


  /*
   * ============================================================
   * KNOWN SONG TITLES
   * ============================================================
   */

  const youtubeTitles = {
    gpLYgQaU1Mk:
      "Песен за душата",

    "03xM_dLyOwI":
      "На стария фар",

    uD3WqddlOVg:
      "Първо либе",

    z6I9QPKcCcY:
      "Росна зора"
  };


  /*
   * ============================================================
   * STYLE
   * ============================================================
   */

  const style =
    document.createElement("style");

  style.textContent = `

    :root {
      --aiba-primary: ${primaryColor};
      --aiba-bg: #0d0f15;
      --aiba-text: #f6f2e9;
      --aiba-muted: #b9b6b0;
      --aiba-border: rgba(216,182,106,.22);
      --aiba-soft: #101219;
      --aiba-success: #86efac;
      --aiba-gold-light: #f3d993;
      --aiba-red: #8e2430;
    }


    #angel-ai-widget-root,
    #angel-ai-widget-root * {
      box-sizing: border-box;
    }


    #angel-ai-widget-root {
      position: fixed;
      z-index: 999999;
      bottom: 22px;

      ${
        position === "bottom-left"
          ? "left: 22px;"
          : "right: 22px;"
      }

      font-family:
        Montserrat,
        Arial,
        sans-serif;
    }


    /* ==========================================
       CHAT BUTTON
       ========================================== */

    .angel-ai-launcher {
      width: 62px;
      height: 62px;

      border: 1px solid
        rgba(243,217,147,.40);

      border-radius: 50%;

      cursor: pointer;

      display: flex;
      align-items: center;
      justify-content: center;

      background:
        linear-gradient(
          135deg,
          var(--aiba-gold-light),
          var(--aiba-primary)
        );

      color: #17130a;

      font-size: 25px;
      font-weight: 900;

      box-shadow:
        0 12px 35px
        rgba(0,0,0,.35);

      transition:
        transform .25s ease,
        box-shadow .25s ease;
    }


    .angel-ai-launcher:hover {
      transform:
        translateY(-3px)
        scale(1.04);

      box-shadow:
        0 17px 42px
        rgba(0,0,0,.45);
    }


    /* ==========================================
       CHAT WINDOW
       ========================================== */

    .angel-ai-window {
      position: absolute;

      bottom: 78px;

      ${
        position === "bottom-left"
          ? "left: 0;"
          : "right: 0;"
      }

      width: 380px;

      max-width:
        calc(100vw - 28px);

      height: 590px;

      max-height:
        calc(100vh - 120px);

      display: none;

      flex-direction: column;

      overflow: hidden;

      border-radius: 22px;

      border:
        1px solid
        var(--aiba-border);

      background:
        radial-gradient(
          circle at 15% 10%,
          rgba(142,36,48,.14),
          transparent 34%
        ),
        var(--aiba-bg);

      box-shadow:
        0 30px 80px
        rgba(0,0,0,.45);
    }


    .angel-ai-window.open {
      display: flex;
    }


    /* ==========================================
       HEADER
       ========================================== */

    .angel-ai-header {
      padding: 16px;

      display: flex;

      align-items: center;

      gap: 12px;

      background:
        radial-gradient(
          circle at top right,
          rgba(243,217,147,.10),
          transparent 38%
        ),
        linear-gradient(
          135deg,
          #171116,
          #0d0f15
        );

      color:
        var(--aiba-text);

      border-bottom:
        1px solid
        rgba(216,182,106,.24);
    }


    .angel-ai-avatar {
      width: 44px;
      height: 44px;

      flex:
        0 0 44px;

      border-radius: 50%;

      display: flex;
      align-items: center;
      justify-content: center;

      background:
        linear-gradient(
          135deg,
          var(--aiba-gold-light),
          var(--aiba-primary)
        );

      color:
        #17130a;

      border:
        1px solid
        rgba(243,217,147,.45);

      font-weight: 900;

      font-family:
        Georgia,
        serif;

      font-size: 16px;
    }


    .angel-ai-header-text {
      min-width: 0;
      flex: 1;
    }


    .angel-ai-agent-name {
      font-size: 16px;

      font-weight: 800;

      line-height: 1.2;

      color:
        var(--aiba-text);
    }


    .angel-ai-business-name {
      margin-top: 3px;

      font-size: 11px;

      color:
        var(--aiba-gold-light);

      opacity: .88;
    }


    .angel-ai-close {
      width: 35px;
      height: 35px;

      border: 0;

      border-radius: 50%;

      cursor: pointer;

      background:
        rgba(216,182,106,.10);

      color:
        var(--aiba-gold-light);

      font-size: 20px;

      display: flex;
      align-items: center;
      justify-content: center;
    }


    .angel-ai-close:hover {
      background:
        rgba(216,182,106,.18);
    }


    /* ==========================================
       MESSAGES + PROFESSIONAL SCROLLBAR
       ========================================== */

    .angel-ai-messages {
      flex: 1;

      min-height: 0;

      overflow-y: auto;
      overflow-x: hidden;

      padding:
        16px 10px 16px 16px;

      background:
        radial-gradient(
          circle at 90% 10%,
          rgba(216,182,106,.055),
          transparent 35%
        );

      scroll-behavior: smooth;

      scrollbar-width: thin;

      scrollbar-color:
        rgba(216,182,106,.72)
        rgba(255,255,255,.025);
    }


    .angel-ai-messages::-webkit-scrollbar {
      width: 7px;
    }


    .angel-ai-messages::-webkit-scrollbar-track {
      background:
        rgba(255,255,255,.025);

      border-radius: 999px;
    }


    .angel-ai-messages::-webkit-scrollbar-thumb {
      background:
        linear-gradient(
          180deg,
          #f3d993,
          #d8b66a
        );

      border-radius: 999px;

      border:
        1px solid
        rgba(13,15,21,.4);
    }


    .angel-ai-messages::-webkit-scrollbar-thumb:hover {
      background:
        #f3d993;
    }


    .angel-ai-message {
      display: flex;

      margin-bottom: 13px;
    }


    .angel-ai-message.agent {
      justify-content:
        flex-start;
    }


    .angel-ai-message.visitor {
      justify-content:
        flex-end;
    }


    .angel-ai-bubble {
      max-width: 88%;

      padding:
        11px 13px;

      border-radius:
        16px;

      font-size:
        14px;

      line-height:
        1.55;

      white-space:
        pre-wrap;

      overflow-wrap:
        anywhere;
    }


    .angel-ai-message.agent
    .angel-ai-bubble {

      background:
        linear-gradient(
          180deg,
          rgba(255,255,255,.045),
          rgba(255,255,255,.025)
        );

      color:
        var(--aiba-text);

      border:
        1px solid
        var(--aiba-border);

      border-bottom-left-radius:
        5px;
    }


    .angel-ai-message.visitor
    .angel-ai-bubble {

      background:
        linear-gradient(
          135deg,
          var(--aiba-gold-light),
          var(--aiba-primary)
        );

      color:
        #17130a;

      font-weight:
        600;

      border-bottom-right-radius:
        5px;
    }


    .angel-ai-message.agent
    .angel-ai-bubble a {

      color:
        var(--aiba-primary);

      font-weight:
        700;

      text-decoration:
        underline;

      text-underline-offset:
        3px;
    }


    .angel-ai-message.agent
    .angel-ai-bubble a:hover {
      opacity: .82;
    }


    /* ==========================================
       YOUTUBE PLAYER
       ========================================== */

    .angel-youtube-card {

      width:
        min(100%, 330px);

      margin:
        10px 0 4px;

      border:
        1px solid
        rgba(216,182,106,.34);

      border-radius:
        15px;

      overflow:
        hidden;

      background:
        #08090d;

      box-shadow:
        0 12px 30px
        rgba(0,0,0,.28);

      white-space:
        normal;
    }


    .angel-youtube-title {

      padding:
        9px 11px;

      color:
        var(--aiba-gold-light);

      background:
        linear-gradient(
          180deg,
          rgba(216,182,106,.11),
          rgba(255,255,255,.02)
        );

      font-size:
        12px;

      font-weight:
        800;

      line-height:
        1.35;
    }


    .angel-youtube-frame {

      position: relative;

      width: 100%;

      aspect-ratio: 16 / 9;

      background: #000;
    }


    .angel-youtube-frame iframe {

      position: absolute;

      inset: 0;

      width: 100%;
      height: 100%;

      border: 0;
    }


    .angel-youtube-open {

      display: block;

      padding:
        8px 11px 9px;

      color:
        var(--aiba-primary) !important;

      font-size:
        11px;

      font-weight:
        800;

      text-decoration:
        underline;

      text-underline-offset:
        3px;
    }


    /* ==========================================
       TYPING
       ========================================== */

    .angel-ai-typing {
      display:
        inline-flex;

      gap: 4px;

      align-items:
        center;
    }


    .angel-ai-typing span {

      width: 6px;
      height: 6px;

      border-radius:
        50%;

      background:
        var(--aiba-primary);

      animation:
        angelTyping
        1.2s infinite ease-in-out;
    }


    .angel-ai-typing span:nth-child(2) {
      animation-delay: .15s;
    }


    .angel-ai-typing span:nth-child(3) {
      animation-delay: .30s;
    }


    @keyframes angelTyping {

      0%,
      60%,
      100% {
        opacity: .30;

        transform:
          translateY(0);
      }

      30% {
        opacity: 1;

        transform:
          translateY(-3px);
      }
    }


    /* ==========================================
       COMPOSER
       ========================================== */

    .angel-ai-composer {

      flex-shrink: 0;

      padding: 11px;

      border-top:
        1px solid
        var(--aiba-border);

      background:
        #0d0f15;
    }


    .angel-ai-input-wrap {

      display: flex;

      align-items:
        flex-end;

      gap: 8px;

      padding: 8px;

      border:
        1px solid
        rgba(216,182,106,.24);

      border-radius:
        16px;

      background:
        rgba(255,255,255,.025);
    }


    .angel-ai-input {

      flex: 1;

      min-height: 38px;

      max-height: 100px;

      resize: none;

      overflow-y: auto;
      overflow-x: hidden;

      scrollbar-width: none;

      -ms-overflow-style: none;

      border: 0;

      outline: 0;

      background:
        transparent;

      color:
        var(--aiba-text);

      font-family:
        inherit;

      font-size:
        14px;

      line-height:
        1.4;
    }


    .angel-ai-input::-webkit-scrollbar {
      display: none;
    }


    .angel-ai-input::placeholder {

      color:
        #8f8b84;
    }


    .angel-ai-send {

      width: 39px;
      height: 39px;

      flex:
        0 0 39px;

      border: 0;

      border-radius:
        12px;

      cursor:
        pointer;

      display: flex;

      align-items:
        center;

      justify-content:
        center;

      background:
        linear-gradient(
          135deg,
          var(--aiba-gold-light),
          var(--aiba-primary)
        );

      color:
        #17130a;

      font-size:
        18px;

      font-weight:
        900;

      transition:
        transform .2s ease,
        opacity .2s ease;
    }


    .angel-ai-send:hover:not(:disabled) {
      transform:
        translateY(-1px);
    }


    .angel-ai-send:disabled {

      opacity: .45;

      cursor: default;
    }


    /* ==========================================
       BOTTOM BAR / NEW CHAT
       ========================================== */

    .angel-ai-meta {

      display: flex;

      align-items: center;

      justify-content:
        space-between;

      gap: 12px;

      padding:
        9px 4px 1px;

      color:
        #8f8b84;

      font-size:
        10px;
    }


    .angel-ai-new-chat {

      border: 0;

      padding: 3px 0;

      background:
        transparent;

      color:
        var(--aiba-primary);

      font-family:
        inherit;

      font-size:
        10px;

      font-weight:
        700;

      cursor:
        pointer;

      transition:
        color .2s ease,
        opacity .2s ease;
    }


    .angel-ai-new-chat:hover {

      color:
        var(--aiba-gold-light);
    }


    .angel-ai-meta-brand {

      color:
        #77736c;

      white-space:
        nowrap;
    }


    /* ==========================================
       MOBILE
       ========================================== */

    @media (
      max-width: 520px
    ) {

      #angel-ai-widget-root {

        bottom: 14px;

        right: 14px;

        left: 14px;
      }


      .angel-ai-launcher {

        margin-left:
          auto;
      }


      .angel-ai-window {

        position: fixed;

        left: 10px;
        right: 10px;

        bottom: 86px;

        width: auto;

        height:
          min(
            650px,
            calc(100vh - 105px)
          );

        max-height: none;
      }


      .angel-ai-meta {

        font-size: 9px;
      }


      .angel-ai-new-chat {

        font-size: 9px;
      }

    }

  `;


  document.head.appendChild(
    style
  );


  /*
   * ============================================================
   * CREATE ROOT
   * ============================================================
   */

  const root =
    document.createElement(
      "div"
    );

  root.id =
    "angel-ai-widget-root";


  /*
   * ============================================================
   * LAUNCHER
   * ============================================================
   */

  const launcher =
    document.createElement(
      "button"
    );

  launcher.type =
    "button";

  launcher.className =
    "angel-ai-launcher";

  launcher.setAttribute(
    "aria-label",
    "Отвори Alex"
  );

  launcher.textContent =
    "AU";


  /*
   * ============================================================
   * WINDOW
   * ============================================================
   */

  const chatWindow =
    document.createElement(
      "div"
    );

  chatWindow.className =
    "angel-ai-window";


  /*
   * ============================================================
   * HEADER
   * ============================================================
   */

  const header =
    document.createElement(
      "div"
    );

  header.className =
    "angel-ai-header";


  const avatar =
    document.createElement(
      "div"
    );

  avatar.className =
    "angel-ai-avatar";

  avatar.textContent =
    "AU";


  const headerText =
    document.createElement(
      "div"
    );

  headerText.className =
    "angel-ai-header-text";


  const agentTitle =
    document.createElement(
      "div"
    );

  agentTitle.className =
    "angel-ai-agent-name";

  agentTitle.textContent =
    agentName;


  const businessTitle =
    document.createElement(
      "div"
    );

  businessTitle.className =
    "angel-ai-business-name";

  businessTitle.textContent =
    businessName;


  headerText.append(
    agentTitle,
    businessTitle
  );


  const closeButton =
    document.createElement(
      "button"
    );

  closeButton.type =
    "button";

  closeButton.className =
    "angel-ai-close";

  closeButton.setAttribute(
    "aria-label",
    "Затвори чата"
  );

  closeButton.textContent =
    "×";


  header.append(
    avatar,
    headerText,
    closeButton
  );


  /*
   * ============================================================
   * MESSAGES
   * ============================================================
   */

  const messages =
    document.createElement(
      "div"
    );

  messages.className =
    "angel-ai-messages";


  /*
   * ============================================================
   * COMPOSER
   * ============================================================
   */

  const composer =
    document.createElement(
      "div"
    );

  composer.className =
    "angel-ai-composer";


  const inputWrap =
    document.createElement(
      "div"
    );

  inputWrap.className =
    "angel-ai-input-wrap";


  const textarea =
    document.createElement(
      "textarea"
    );

  textarea.className =
    "angel-ai-input";

  textarea.rows =
    1;

  textarea.placeholder =
    "Напишете съобщение...";


  const sendButton =
    document.createElement(
      "button"
    );

  sendButton.type =
    "button";

  sendButton.className =
    "angel-ai-send";

  sendButton.setAttribute(
    "aria-label",
    "Изпрати"
  );

  sendButton.textContent =
    "➤";


  inputWrap.append(
    textarea,
    sendButton
  );


  /*
   * ============================================================
   * BOTTOM META BAR
   * ============================================================
   */

  const meta =
    document.createElement(
      "div"
    );

  meta.className =
    "angel-ai-meta";


  const newChatButton =
    document.createElement(
      "button"
    );

  newChatButton.type =
    "button";

  newChatButton.className =
    "angel-ai-new-chat";

  newChatButton.textContent =
    "↻ Нов разговор";


  const metaBrand =
    document.createElement(
      "span"
    );

  metaBrand.className =
    "angel-ai-meta-brand";

  metaBrand.textContent =
    "Alex • Angel Uzunov";


  meta.append(
    newChatButton,
    metaBrand
  );


  composer.append(
    inputWrap,
    meta
  );


  chatWindow.append(
    header,
    messages,
    composer
  );


  root.append(
    chatWindow,
    launcher
  );


  document.body.appendChild(
    root
  );


  /*
   * ============================================================
   * YOUTUBE
   * ============================================================
   */

  function getYouTubeVideoId(
    value
  ) {

    try {

      const url =
        new URL(value);

      const host =
        url.hostname.replace(
          /^www\./,
          ""
        );


      if (
        host === "youtu.be"
      ) {

        return (
          url.pathname
            .split("/")
            .filter(Boolean)[0] ||
          ""
        );
      }


      if (
        host === "youtube.com" ||
        host === "m.youtube.com"
      ) {

        if (
          url.pathname ===
          "/watch"
        ) {

          return (
            url.searchParams.get(
              "v"
            ) ||
            ""
          );
        }


        if (
          url.pathname.startsWith(
            "/shorts/"
          )
        ) {

          return (
            url.pathname
              .split("/shorts/")[1]
              ?.split("/")[0] ||
            ""
          );
        }


        if (
          url.pathname.startsWith(
            "/embed/"
          )
        ) {

          return (
            url.pathname
              .split("/embed/")[1]
              ?.split("/")[0] ||
            ""
          );
        }

      }

    } catch {

      return "";

    }


    return "";
  }


  function createSafeExternalLink(
    label,
    url
  ) {

    const link =
      document.createElement(
        "a"
      );

    link.textContent =
      label;

    link.href =
      url;

    link.target =
      "_blank";

    link.rel =
      "noopener noreferrer";

    return link;
  }


  function createYouTubeCard(
    url,
    videoId,
    label = ""
  ) {

    const card =
      document.createElement(
        "div"
      );

    card.className =
      "angel-youtube-card";


    const title =
      document.createElement(
        "div"
      );

    title.className =
      "angel-youtube-title";


    title.textContent =
      "🎵 " +
      (
        youtubeTitles[videoId] ||
        label ||
        "Видео на Ангел Узунов"
      );


    const frame =
      document.createElement(
        "div"
      );

    frame.className =
      "angel-youtube-frame";


    const iframe =
      document.createElement(
        "iframe"
      );


    iframe.src =
      "https://www.youtube-nocookie.com/embed/" +
      encodeURIComponent(
        videoId
      ) +
      "?rel=0&modestbranding=1&playsinline=1";


    iframe.title =
      youtubeTitles[videoId]
        ? youtubeTitles[videoId] +
          " – Ангел Узунов"
        : "YouTube видео – Ангел Узунов";


    iframe.loading =
      "lazy";


    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";


    iframe.allowFullscreen =
      true;


    frame.appendChild(
      iframe
    );


    const open =
      createSafeExternalLink(
        "▶ Отвори в YouTube",
        url
      );


    open.className =
      "angel-youtube-open";


    card.append(
      title,
      frame,
      open
    );


    return card;
  }


  /*
   * ============================================================
   * SAFE MESSAGE RENDERER
   * ============================================================
   */

  function appendSafeMessageContent(
    bubble,
    content
  ) {

    const value =
      String(
        content || ""
      );


    const tokenPattern =
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)|(https?:\/\/[^\s<>"']+)/g;


    let lastIndex =
      0;

    let match;


    while (
      (
        match =
          tokenPattern.exec(
            value
          )
      ) !== null
    ) {

      const before =
        value.slice(
          lastIndex,
          match.index
        );


      if (before) {

        bubble.appendChild(
          document.createTextNode(
            before
          )
        );

      }


      const label =
        match[1] ||
        "";


      const rawUrl =
        match[2] ||
        match[3] ||
        "";


      const url =
        rawUrl.replace(
          /[),.;!?]+$/g,
          ""
        );


      const trailing =
        rawUrl.slice(
          url.length
        );


      const videoId =
        getYouTubeVideoId(
          url
        );


      if (videoId) {

        bubble.appendChild(
          createYouTubeCard(
            url,
            videoId,
            label
          )
        );

      } else {

        bubble.appendChild(
          createSafeExternalLink(
            label || url,
            url
          )
        );

      }


      if (trailing) {

        bubble.appendChild(
          document.createTextNode(
            trailing
          )
        );

      }


      lastIndex =
        tokenPattern.lastIndex;
    }


    const after =
      value.slice(
        lastIndex
      );


    if (after) {

      bubble.appendChild(
        document.createTextNode(
          after
        )
      );

    }

  }


  /*
   * ============================================================
   * ADD MESSAGE
   * ============================================================
   */

  function addMessage(
    role,
    content
  ) {

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "angel-ai-message " +
      (
        role === "visitor"
          ? "visitor"
          : "agent"
      );


    const bubble =
      document.createElement(
        "div"
      );

    bubble.className =
      "angel-ai-bubble";


    if (
      role === "agent"
    ) {

      appendSafeMessageContent(
        bubble,
        content
      );

    } else {

      bubble.textContent =
        String(
          content || ""
        );

    }


    row.appendChild(
      bubble
    );


    messages.appendChild(
      row
    );


    messages.scrollTop =
      messages.scrollHeight;


    return row;
  }


  /*
   * ============================================================
   * TYPING INDICATOR
   * ============================================================
   */

  function showTyping() {

    const row =
      document.createElement(
        "div"
      );

    row.className =
      "angel-ai-message agent";


    const bubble =
      document.createElement(
        "div"
      );

    bubble.className =
      "angel-ai-bubble";


    const typing =
      document.createElement(
        "div"
      );

    typing.className =
      "angel-ai-typing";


    typing.innerHTML =
      "<span></span><span></span><span></span>";


    bubble.appendChild(
      typing
    );


    row.appendChild(
      bubble
    );


    messages.appendChild(
      row
    );


    messages.scrollTop =
      messages.scrollHeight;


    return row;
  }


  /*
   * ============================================================
   * SESSION
   * ============================================================
   */

  const sessionStorageKey =
    "angel_uzunov_ai_session";


  function createSessionId() {

    return (
      window.crypto &&
      crypto.randomUUID
    )
      ? crypto.randomUUID()
      : (
          Date.now() +
          "-" +
          Math.random()
            .toString(36)
            .slice(2)
        );

  }


  let sessionId =
    sessionStorage.getItem(
      sessionStorageKey
    );


  if (!sessionId) {

    sessionId =
      createSessionId();


    sessionStorage.setItem(
      sessionStorageKey,
      sessionId
    );

  }


  /*
   * ============================================================
   * API
   * ============================================================
   */

  async function sendToAlex(
    message
  ) {

    const endpoints = [

      apiBase +
      "/api/widget/chat",

      apiBase +
      "/api/agent/chat",

      apiBase +
      "/api/chat"

    ];


    let lastError =
      null;


    for (
      const endpoint of
      endpoints
    ) {

      try {

        const response =
          await fetch(
            endpoint,
            {

              method:
                "POST",

              headers: {

                "Content-Type":
                  "application/json"

              },

              body:
                JSON.stringify({

                  widgetKey:
                    widgetKey,

                  widget_key:
                    widgetKey,

                  message:
                    message,

                  sessionId:
                    sessionId,

                  session_id:
                    sessionId

                })

            }
          );


        if (
          !response.ok
        ) {

          lastError =
            new Error(
              "HTTP " +
              response.status
            );

          continue;
        }


        const data =
          await response.json();


        const answer =
          data.reply ||
          data.message ||
          data.response ||
          data.answer ||
          data.content ||
          data.text;


        if (answer) {

          return String(
            answer
          );

        }


        lastError =
          new Error(
            "No answer returned."
          );


      } catch (error) {

        lastError =
          error;

      }

    }


    console.error(
      "[Angel Uzunov AI]",
      lastError
    );


    throw (
      lastError ||
      new Error(
        "AI Business API error."
      )
    );

  }


  /*
   * ============================================================
   * SEND MESSAGE
   * ============================================================
   */

  let sending =
    false;


  async function sendMessage() {

    const message =
      textarea.value.trim();


    if (
      !message ||
      sending
    ) {
      return;
    }


    sending =
      true;


    sendButton.disabled =
      true;


    textarea.value =
      "";


    addMessage(
      "visitor",
      message
    );


    const typing =
      showTyping();


    try {

      const reply =
        await sendToAlex(
          message
        );


      typing.remove();


      addMessage(
        "agent",
        reply
      );


    } catch (error) {

      typing.remove();


      addMessage(
        "agent",
        "В момента не успявам да се свържа с услугата. Моля, опитайте отново след малко."
      );


      console.error(
        "[Angel Uzunov AI]",
        error
      );

    } finally {

      sending =
        false;


      sendButton.disabled =
        false;


      textarea.focus();

    }

  }


  /*
   * ============================================================
   * EVENTS
   * ============================================================
   */

  launcher.addEventListener(
    "click",
    function () {

      chatWindow.classList.toggle(
        "open"
      );


      if (
        chatWindow.classList.contains(
          "open"
        )
      ) {

        setTimeout(
          () =>
            textarea.focus(),
          100
        );

      }

    }
  );


  closeButton.addEventListener(
    "click",
    function () {

      chatWindow.classList.remove(
        "open"
      );

    }
  );


  sendButton.addEventListener(
    "click",
    sendMessage
  );


  textarea.addEventListener(
    "keydown",
    function (event) {

      if (
        event.key === "Enter" &&
        !event.shiftKey
      ) {

        event.preventDefault();

        sendMessage();

      }

    }
  );


  /*
   * ============================================================
   * NEW CONVERSATION
   * ============================================================
   */

  newChatButton.addEventListener(
    "click",
    function () {

      /*
       * Не позволяваме рестарт,
       * докато чакаме отговор.
       */

      if (sending) {
        return;
      }


      /*
       * Създаваме напълно нова
       * session ID за AI Business.
       */

      sessionId =
        createSessionId();


      sessionStorage.setItem(
        sessionStorageKey,
        sessionId
      );


      /*
       * Изчистваме визуално
       * предишния разговор.
       */

      messages.innerHTML =
        "";


      textarea.value =
        "";


      /*
       * Показваме отново
       * началното съобщение.
       */

      if (
        welcomeMessage
      ) {

        addMessage(
          "agent",
          welcomeMessage
        );

      }


      textarea.focus();

    }
  );


  /*
   * ============================================================
   * WELCOME MESSAGE
   * ============================================================
   */

  if (
    welcomeMessage
  ) {

    addMessage(
      "agent",
      welcomeMessage
    );

  }


  console.info(
    "[Angel Uzunov AI] Personal widget loaded."
  );

})();
