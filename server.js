const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Chave da CashInPay fornecida
const CASHINPAY_API_KEY = 'sk_live_81f5f181f0d7df1aa84a3d0ef77e63b1ca1731cd';

app.post('/api/criar-pix', async (req, res) => {
    try {
        const orderData = req.body;

        const response = await fetch('https://cashinpaybr.com/api/v1/pix/cash-in', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${CASHINPAY_API_KEY}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify({
                amount: 89.90,
                external_reference: "KIT_DRYFIT_" + Date.now(),
                payer: {
                    name: orderData.name,
                    phone: orderData.whatsapp ? orderData.whatsapp.replace(/\D/g, '') : ''
                }
            })
        });

        const data = await response.json();

        if (response.ok && (data.success || data.qr_code)) {
            const qrCodeText = data.qr_code || data.pix_copia_e_cola;
            const qrCodeImage = data.qr_code_base64 || `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(qrCodeText)}`;

            return res.json({
                success: true,
                qr_code: qrCodeText,
                qr_code_base64: qrCodeImage
            });
        } else {
            return res.status(400).json({ 
                success: false, 
                message: data.message || 'Erro ao gerar o PIX na CashInPay' 
            });
        }

    } catch (error) {
        console.error('Erro no servidor:', error);
        return res.status(500).json({ success: false, message: 'Erro interno no servidor' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
