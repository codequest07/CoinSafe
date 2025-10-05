export interface ServiceWorkerRegistrationConfig {
  onSuccess?: (registration: ServiceWorkerRegistration) => void;
  onUpdate?: (registration: ServiceWorkerRegistration) => void;
  onError?: (error: Error) => void;
}

const isLocalhost = Boolean(
  window.location.hostname === 'localhost' ||
  window.location.hostname === '[::1]' ||
  window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/)
);

export async function registerServiceWorker(
  swUrl: string,
  config?: ServiceWorkerRegistrationConfig
): Promise<ServiceWorkerRegistration | undefined> {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers are not supported');
    return undefined;
  }

  // Wait for window to load
  await new Promise((resolve) => {
    if (document.readyState === 'complete') {
      resolve(true);
    } else {
      window.addEventListener('load', resolve, { once: true });
    }
  });

  if (isLocalhost) {
    // Check if service worker exists in localhost
    await checkValidServiceWorker(swUrl, config);
  } else {
    // Register service worker
    await registerValidSW(swUrl, config);
  }
}

async function registerValidSW(
  swUrl: string,
  config?: ServiceWorkerRegistrationConfig
): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register(swUrl);

    registration.onupdatefound = () => {
      const installingWorker = registration.installing;
      if (!installingWorker) return;

      installingWorker.onstatechange = () => {
        if (installingWorker.state === 'installed') {
          if (navigator.serviceWorker.controller) {
            // New update available
            console.log('New content is available; please refresh.');
            config?.onUpdate?.(registration);
          } else {
            // Content is cached for offline use
            console.log('Content is cached for offline use.');
            config?.onSuccess?.(registration);
          }
        }
      };
    };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Service worker registration failed');
    console.error('Error during service worker registration:', err);
    config?.onError?.(err);
  }
}

async function checkValidServiceWorker(
  swUrl: string,
  config?: ServiceWorkerRegistrationConfig
): Promise<void> {
  try {
    const response = await fetch(swUrl, {
      headers: { 'Service-Worker': 'script' },
    });

    const contentType = response.headers.get('content-type');
    if (
      response.status === 404 ||
      (contentType != null && contentType.indexOf('javascript') === -1)
    ) {
      // No service worker found
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
      window.location.reload();
    } else {
      // Service worker found
      await registerValidSW(swUrl, config);
    }
  } catch (error) {
    console.log('No internet connection found. App is running in offline mode.');
  }
}

export async function unregisterServiceWorker(): Promise<void> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.unregister();
    } catch (error) {
      console.error('Error unregistering service worker:', error);
    }
  }
}