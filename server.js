const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());

// Pega o Token com segurança das variáveis do Railway
const CASHINPAY_TOKEN = process.env.CASHINPAY_TOKEN;

app.post('/gerar-pix', async (req, res) => {
    try {
        const { valor, cliente, item } = req.body;

        // Requisição para a API oficial da CashInPay
        const response = await axios.post('https://api.cashinpay.com.br/api/v1/pix/create', {
            amount: valor,
            payer: {
                name: cliente.nome,
                document: cliente.cpf,
                phone: cliente.telefone
            },
            description: item
        }, {
            headers: {
                'Authorization': `Bearer ${CASHINPAY_TOKEN}`,
                'Content-Type': 'application/json'
            }
        });

        return res.json({
            qrcode: response.data.pix_code || response.data.qrcode,
            qr_code_image: response.data.qr_code_image || response.data.imagem_base64
        });

    } catch (error) {
        console.error('Erro ao gerar PIX:', error.response?.data || error.message);
        return res.status(500).json({ error: 'Erro ao processar pagamento no servidor.' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
