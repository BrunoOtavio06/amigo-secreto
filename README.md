# 🎁 Amigo Secreto da Família Carvalho

Site estático: cada pessoa abre o seu link (`/bruno`, `/catarina`, …), toca em
**Revelar meu amigo secreto** e vê quem tirou. Nada de banco de dados — o
resultado do sorteio fica gravado nas próprias páginas, em `docs/`.

O sorteio forma **um único círculo** com todo mundo (A → B → C → … → A): ninguém
tira a si mesmo e nunca sobra um grupinho fechado.

## Fazer o sorteio

1. Coloque os nomes em `nomes.txt`, um por linha.
2. Rode:

   ```bash
   node sortear.mjs
   ```

   O script mostra os links de cada pessoa (sem revelar quem tirou quem).

Se rodar de novo, ele recusa, para ninguém sortear de novo sem querer depois que
os links já foram enviados. Para refazer de propósito: `node sortear.mjs --refazer`.

## Publicar

**GitHub Pages:** suba o repositório, vá em *Settings → Pages → Deploy from a
branch*, escolha a branch `main` e a pasta `/docs`.
Links: `https://SEU-USUARIO.github.io/NOME-DO-REPO/bruno`

**Vercel:** importe o repositório (o `vercel.json` já aponta para `docs/`).
Links: `https://SEU-PROJETO.vercel.app/bruno`

Links digitados com maiúscula ou acento (`/Catarina`, `/João-Pedro`) são
corrigidos automaticamente.
