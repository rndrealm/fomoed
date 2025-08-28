const DEBUG = true;

self.addEventListener("install", (event) => {
  console.log("SW installed. Skipping waiting...");
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  console.log("SW activated");
});

function sendClearCookies() {
  self.clients.matchAll().then((clients) => {
    clients.forEach((client) => {
      client.postMessage("please-clear-cookies");
    });
  });
  console.log("[SW] Sent message to client to clear cookies");
}

function supabaseResponseHandler(response) {
  if (DEBUG) {
    response
      .clone()
      .text()
      .then((body) => {
        console.log("[SW] Supabase response:", body);
      });
  }

  // Catch refresh_token_not_found error
  response
    .clone()
    .json()
    .then((json) => {
      if (DEBUG) {
        console.log("[SW] Supabase JSON response:", json);
      }

      if (json?.code === "refresh_token_not_found") {
        console.log("[SW] Detected refresh_token_not_found error");
        sendClearCookies();
      }
    });
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (url.hostname.endsWith("supabase.co")) {
    event.respondWith(
      fetch(event.request).then((response) => {
        supabaseResponseHandler(response.clone());

        return response;
      }),
    );
  }
});
