// Handler default Vercel untuk Serverless Function
export default async function handler(request, response) {
    
    // 1. Hanya izinkan metode POST
    if (request.method !== 'POST') {
        return response.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        // 2. Ambil Kunci API rahasia dari Vercel Environment Variables
        // Kita akan mengatur ini di Vercel nanti dengan nama 'GEMINI_API_KEY'
        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey) {
            // Ini adalah pesan error untuk sisi server (Vercel) jika kita lupa mengatur kuncinya
            console.error("Kunci API (GEMINI_API_KEY) tidak diatur di server.");
            return response.status(500).json({ error: 'Konfigurasi server tidak lengkap.' });
        }

        // 3. Ambil data yang dikirim dari frontend (index.html)
        // Kita akan memodifikasi index.html untuk mengirim 'model' dan 'payload'
        // const { model, payload } = await request.json(); // <--- INI SALAH
        const { model, payload } = request.body; // <--- INI PERBAIKANNYA

        if (!model || !payload) {
            return response.status(400).json({ error: "Permintaan tidak lengkap. Butuh 'model' dan 'payload'." });
        }

        // 4. Tentukan URL Google API yang dituju
        // Kita menggunakan nama model yang dikirim dari frontend
        const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

        // 5. Kirim permintaan (fetch) ke Google AI dari server Vercel
        const googleResponse = await fetch(googleApiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload) // Teruskan payload asli dari frontend
        });

        // 6. Ambil data respons dari Google
        const googleData = await googleResponse.json();

        // 7. Periksa jika ada error dari Google
        if (!googleResponse.ok) {
            console.error("Error dari Google API:", googleData);
            return response.status(googleResponse.status).json({ 
                error: "Gagal menghubungi Google AI", 
                details: googleData 
            });
        }

        // 8. Kirim hasil sukses kembali ke frontend (index.html)
        return response.status(200).json(googleData);

    } catch (error) {
        // Tangani error internal di server Vercel
        console.error("Error di server proxy:", error);
        return response.status(500).json({ 
            error: 'Kesalahan Internal Server', 
            details: error.message 
        });
    }
}
