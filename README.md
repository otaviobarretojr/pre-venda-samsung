# Pré-venda Samsung — PWA

Arquivos prontos para publicar via GitHub Pages.

## Conteúdo
- `index.html` — sistema v4.3 online
- `manifest.webmanifest` — configuração de instalação
- `service-worker.js` — cache do app
- `icon-192.png` e `icon-512.png` — ícones PWA

## Publicação no GitHub Pages
1. Crie um repositório público chamado `pre-venda-samsung`.
2. Envie todos os arquivos desta pasta para a raiz do repositório.
3. Em **Settings > Pages**, selecione **Deploy from a branch**.
4. Branch: `main`, pasta: `/ (root)`.
5. Salve e aguarde o endereço do GitHub Pages.
6. Abra o endereço no Chrome Android.
7. Use **Instalar app** ou **Adicionar à tela inicial**.

## Banco
O sistema continua conectado ao mesmo projeto Supabase configurado na v4.2.

## Segurança
A aplicação usa apenas a Publishable key no navegador. Nunca publique `service_role`, secret key ou senha do banco.
