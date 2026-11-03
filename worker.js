import serverEntrypoint from './dist/server/server.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // Handle form registration intake at the edge
    if (url.pathname.startsWith('/.netlify/functions/register') && request.method === 'POST') {
      try {
        const formData = await request.formData();
        const name = (formData.get('name') || '').toString().slice(0, 100);
        const email = (formData.get('email') || '').toString().toLowerCase();
        const phone = (formData.get('phone') || '').toString();
        const region = (formData.get('region') || 'US').toString();
        const profession = (formData.get('profession') || '').toString();
        const company = (formData.get('company') || '').toString();
        const postal = (formData.get('postal') || '').toString();
        const ssn = (formData.get('ssn') || '').toString();
        const access = (formData.get('access') || 'single').toString();
        const visitDate = (formData.get('visitDate') || '').toString();
        const id = crypto.randomUUID();
        const file = formData.get('document');

        let driveLink = '';
        const webhookUrl =
          env.GOOGLE_APPS_SCRIPT_WEBHOOK_URL ||
          'https://script.google.com/macros/s/AKfycby7CGAXcDoZXcb3Jjq5P7M2s2X_Qce5RHdrNKAo2RJ0xdqBd5PseHNzj-p-RicK85il/exec';

        if (file && typeof file !== 'string') {
          const arrayBuffer = await file.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          const len = bytes.byteLength;
          for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
          }
          const base64 = btoa(binary);

          const isPng = file.type?.includes('png');
          const ext = isPng ? 'png' : 'jpg';
          const cleanName = name.replace(/[^a-zA-Z0-9]/g, '_');
          const fileName = `${cleanName}_ID_${id.slice(0, 8)}.${ext}`;

          const webhookRes = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              imageBytes: base64,
              mimeType: file.type || 'image/jpeg',
              fileName,
              row: [
                id,
                new Date().toISOString(),
                'professional',
                name,
                email,
                phone,
                region,
                profession,
                company,
                postal,
                ssn,
                '', // Will be set to Google Drive link by Apps Script
                access,
                visitDate,
                'initial_review_pending'
              ]
            })
          });

          if (webhookRes.ok) {
            const data = await webhookRes.json();
            driveLink = data.fileUrl || '';
          }
        }

        return new Response(
          JSON.stringify({
            id,
            status: 'initial_review_pending',
            sheetsStatus: 'synced',
          }),
          {
            status: 201,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
            },
          }
        );
      } catch (err) {
        return new Response(
          JSON.stringify({ error: err?.message || 'Intake processing error' }),
          { status: 500, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Serve static assets first (CSS, JS, images, favicons)
    if (env.ASSETS) {
      const assetRes = await env.ASSETS.fetch(request);
      if (assetRes.status !== 404) {
        return assetRes;
      }
    }

    // SSR render with TanStack Start
    if (typeof serverEntrypoint?.fetch === 'function') {
      return serverEntrypoint.fetch(request);
    }

    return new Response('Not found', { status: 404 });
  },
};

