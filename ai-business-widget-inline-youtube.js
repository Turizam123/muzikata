(() => {
  "use strict";

  /* ==========================================
     ANGEL UZUNOV — ALEX AI + YOUTUBE PLAYER
     ========================================== */

  const CONFIG = {
    remoteWidgetSrc:
      "https://ai-business-agent-nine.vercel.app/ai-business-widget.js",

    widgetKey:
      "1db7c3f5-125c-4f52-ba5e-632ebe1d1829",

    agentName: "Alex",

    businessName: "Angel Uzunov",

    welcomeMessage:
      "Здравейте! Аз съм Alex. Как мога да ви помогна?",

    position: "bottom-right",

    branding: "true"
  };


  /* ==========================================
     ПЕСНИ
     ========================================== */

  const SONGS = [
    {
      title: "Песен за душата",
      id: "gpLYgQaU1Mk"
    },

    {
      title: "На стария фар",
      id: "03xM_dLyOwI"
    },

    {
      title: "Първо либе",
      id: "uD3WqddlOVg"
    },

    {
      title: "Росна зора",
      id: "z6I9QPKcCcY"
    }
  ];


  /* ==========================================
     ЗАРЕЖДАНЕ НА ALEX
     ========================================== */

  function loadWidget() {

    if (
      document.querySelector(
        `script[src="${CONFIG.remoteWidgetSrc}"]`
      )
    ) {
      return;
    }

    const script = document.createElement("script");

    script.src = CONFIG.remoteWidgetSrc;

    script.async = true;

    script.dataset.widgetKey =
      CONFIG.widgetKey;

    script.dataset.agentName =
      CONFIG.agentName;

    script.dataset.businessName =
      CONFIG.businessName;

    script.dataset.welcomeMessage =
      CONFIG.welcomeMessage;

    script.dataset.position =
      CONFIG.position;

    script.dataset.branding =
      CONFIG.branding;

    document.body.appendChild(script);
  }


  /* ==========================================
     ВЗЕМА YOUTUBE VIDEO ID
     ========================================== */

  function getYouTubeID(url) {

    try {

      const parsed =
        new URL(url);

      if (
        parsed.hostname.includes(
          "youtu.be"
        )
      ) {

        return parsed.pathname
          .slice(1)
          .split("/")[0];
      }


      if (
        parsed.pathname === "/watch"
      ) {

        return (
          parsed.searchParams.get("v") ||
          ""
        );
      }


      if (
        parsed.pathname.startsWith(
          "/shorts/"
        )
      ) {

        return parsed.pathname
          .split("/shorts/")[1]
          .split("/")[0];
      }


      if (
        parsed.pathname.startsWith(
          "/embed/"
        )
      ) {

        return parsed.pathname
          .split("/embed/")[1]
          .split("/")[0];
      }

    } catch (error) {

      console.log(
        "YouTube URL error:",
        error
      );
    }

    return "";
  }


  /* ==========================================
     НАМИРА ИМЕТО НА ПЕСЕНТА
     ========================================== */

  function getSongTitle(videoID) {

    const song =
      SONGS.find(
        item =>
          item.id === videoID
      );

    if (song) {
      return song.title;
    }

    return "YouTube видео";
  }


  /* ==========================================
     СЪЗДАВА YOUTUBE PLAYER
     ========================================== */

  function createPlayer(
    url,
    videoID
  ) {

    const title =
      getSongTitle(videoID);


    const box =
      document.createElement("div");

    box.className =
      "angel-youtube-player";


    box.style.cssText = `
      width:100%;
      max-width:320px;

      margin-top:12px;
      margin-bottom:10px;

      background:#08090d;

      border:
        1px solid
        rgba(216,182,106,.40);

      border-radius:16px;

      overflow:hidden;

      box-shadow:
        0 10px 28px
        rgba(0,0,0,.30);
    `;


    /* ---------- Заглавие ---------- */

    const heading =
      document.createElement("div");


    heading.textContent =
      "🎵 " + title;


    heading.style.cssText = `
      padding:
        10px 12px;

      color:#f3d993;

      background:
        linear-gradient(
          180deg,
          rgba(216,182,106,.12),
          rgba(255,255,255,.02)
        );

      font-size:13px;

      font-weight:800;

      font-family:
        Arial,
        sans-serif;
    `;


    box.appendChild(
      heading
    );


    /* ---------- Video container ---------- */

    const videoWrap =
      document.createElement("div");


    videoWrap.style.cssText = `
      position:relative;

      width:100%;

      aspect-ratio:16/9;

      background:#000;
    `;


    /* ---------- YouTube iframe ---------- */

    const iframe =
      document.createElement(
        "iframe"
      );


    iframe.src =
      "https://www.youtube-nocookie.com/embed/" +
      encodeURIComponent(videoID) +
      "?rel=0&modestbranding=1&playsinline=1";


    iframe.title =
      title +
      " – Ангел Узунов";


    iframe.loading =
      "lazy";


    iframe.allow =
      "accelerometer; " +
      "autoplay; " +
      "clipboard-write; " +
      "encrypted-media; " +
      "gyroscope; " +
      "picture-in-picture; " +
      "web-share";


    iframe.allowFullscreen =
      true;


    iframe.style.cssText = `
      position:absolute;

      top:0;
      left:0;

      width:100%;
      height:100%;

      border:0;
    `;


    videoWrap.appendChild(
      iframe
    );


    box.appendChild(
      videoWrap
    );


    /* ---------- YouTube link ---------- */

    const youtubeLink =
      document.createElement("a");


    youtubeLink.href =
      url;


    youtubeLink.target =
      "_blank";


    youtubeLink.rel =
      "noopener noreferrer";


    youtubeLink.textContent =
      "▶ Отвори в YouTube";


    youtubeLink.style.cssText = `
      display:block;

      padding:
        9px 12px;

      color:#d8b66a;

      text-decoration:
        underline;

      text-underline-offset:
        3px;

      font-size:
        11px;

      font-weight:
        700;

      font-family:
        Arial,
        sans-serif;
    `;


    youtubeLink.addEventListener(
      "mouseenter",
      function () {

        this.style.color =
          "#f3d993";
      }
    );


    youtubeLink.addEventListener(
      "mouseleave",
      function () {

        this.style.color =
          "#d8b66a";
      }
    );


    box.appendChild(
      youtubeLink
    );


    return box;
  }


  /* ==========================================
     РАЗПОЗНАВАНЕ НА YOUTUBE URL
     ========================================== */

  const YOUTUBE_REGEX =
    /https?:\/\/(?:(?:www|m)\.)?(?:youtube\.com\/watch\?[^\s<>"']*v=[A-Za-z0-9_-]{6,}|youtube\.com\/(?:shorts|embed)\/[A-Za-z0-9_-]{6,}|youtu\.be\/[A-Za-z0-9_-]{6,})[^\s<>"']*/gi;


  /* ==========================================
     ЗАМЕНЯ ЛИНКА С PLAYER
     ========================================== */

  function convertTextNode(
    textNode
  ) {

    const text =
      textNode.nodeValue || "";


    if (
      !text.includes("youtu")
    ) {
      return;
    }


    const parent =
      textNode.parentElement;


    if (!parent) {
      return;
    }


    /*
       Не обработваме URL,
       ако вече е вътре в player.
    */

    if (
      parent.closest(
        ".angel-youtube-player"
      )
    ) {
      return;
    }


    if (
      parent.closest(
        "script, style, textarea, input, iframe"
      )
    ) {
      return;
    }


    YOUTUBE_REGEX.lastIndex =
      0;


    const matches =
      [
        ...text.matchAll(
          YOUTUBE_REGEX
        )
      ];


    if (
      matches.length === 0
    ) {
      return;
    }


    const fragment =
      document.createDocumentFragment();


    let lastIndex =
      0;


    matches.forEach(
      match => {

        const rawURL =
          match[0];


        const start =
          match.index || 0;


        /* Текстът преди URL */

        if (
          start > lastIndex
        ) {

          fragment.appendChild(
            document.createTextNode(
              text.slice(
                lastIndex,
                start
              )
            )
          );
        }


        /*
           Премахваме точка,
           запетая и др.
           след URL.
        */

        const cleanURL =
          rawURL.replace(
            /[),.;!?]+$/g,
            ""
          );


        const videoID =
          getYouTubeID(
            cleanURL
          );


        if (videoID) {

          fragment.appendChild(
            createPlayer(
              cleanURL,
              videoID
            )
          );

        } else {

          fragment.appendChild(
            document.createTextNode(
              cleanURL
            )
          );
        }


        const trailing =
          rawURL.slice(
            cleanURL.length
          );


        if (trailing) {

          fragment.appendChild(
            document.createTextNode(
              trailing
            )
          );
        }


        lastIndex =
          start +
          rawURL.length;
      }
    );


    /* Текстът след URL */

    if (
      lastIndex <
      text.length
    ) {

      fragment.appendChild(
        document.createTextNode(
          text.slice(
            lastIndex
          )
        )
      );
    }


    textNode.replaceWith(
      fragment
    );
  }


  /* ==========================================
     СКАНИРА CHAT DOM
     ========================================== */

  function scanDOM(root) {

    if (!root) {
      return;
    }


    const walker =
      document.createTreeWalker(
        root,
        NodeFilter.SHOW_TEXT
      );


    const nodes =
      [];


    while (
      walker.nextNode()
    ) {

      const node =
        walker.currentNode;


      if (
        (
          node.nodeValue ||
          ""
        ).includes(
          "youtu"
        )
      ) {

        nodes.push(
          node
        );
      }
    }


    nodes.forEach(
      convertTextNode
    );


    /*
       Проверяваме и Shadow DOM,
       ако Alex използва такъв.
    */

    if (
      root.querySelectorAll
    ) {

      root
        .querySelectorAll("*")
        .forEach(
          element => {

            if (
              element.shadowRoot
            ) {

              scanDOM(
                element.shadowRoot
              );
            }
          }
        );
    }
  }


  /* ==========================================
     НАБЛЮДАВА НОВИТЕ СЪОБЩЕНИЯ
     ========================================== */

  function startYouTubeMonitor() {

    const run =
      () =>
        scanDOM(
          document
        );


    run();


    const observer =
      new MutationObserver(
        () => {

          requestAnimationFrame(
            run
          );
        }
      );


    observer.observe(
      document.documentElement,
      {
        childList:true,
        subtree:true,
        characterData:true
      }
    );


    /*
       Допълнителни проверки,
       защото widget-ът може
       да се зареди със закъснение.
    */

    setTimeout(
      run,
      1000
    );

    setTimeout(
      run,
      2500
    );

    setTimeout(
      run,
      5000
    );

    setTimeout(
      run,
      8000
    );
  }


  /* ==========================================
     START
     ========================================== */

  function start() {

    loadWidget();

    startYouTubeMonitor();


    console.log(
      "Angel Uzunov — Alex AI YouTube Player loaded."
    );
  }


  if (
    document.readyState ===
    "loading"
  ) {

    document.addEventListener(
      "DOMContentLoaded",
      start,
      {
        once:true
      }
    );

  } else {

    start();
  }

})();
