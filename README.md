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

## Fotos

Quando a pessoa revela o amigo secreto, aparece a foto dele numa moldura de
Natal, com gorro de Papai Noel. Para colocar ou trocar as fotos **sem refazer o
sorteio**:

1. Salve cada foto em `fotos/` com o nome do link da pessoa: `fotos/bruno.jpg`,
   `fotos/flavia.png`, `fotos/joao-pedro.heic`… (jpg, png, webp ou heic).
2. Rode:

   ```bash
   node atualizar-fotos.mjs
   ```

O script lê quem tirou quem das próprias páginas em `docs/`, gera as páginas de
novo com as fotos e confere no fim que nenhum resultado mudou. Quem ainda não
tem foto aparece com a inicial do nome no lugar.

A foto é recortada em quadrado automaticamente. Se cortar mal, ou se quiser o
gorro na cabeça da pessoa em vez do canto da moldura, crie `fotos/ajustes.json`:

```json
{
  "bruno": {
    "foco": [50, 30],
    "zoom": 1.4,
    "gorro": { "x": 22, "y": -14, "largura": 52, "giro": -12 }
  },
  "theo": { "gorro": false }
}
```

- `foco`: ponto da foto original que fica no centro, em % (horizontal, vertical).
- `zoom`: acima de 1 aproxima (bom para fotos em grupo).
- `gorro`: posição em % do lado da foto (`x`, `y` = canto de cima à
  esquerda do gorro), `largura` em % e `giro` em graus. `false` tira o gorro.

## Publicar

**GitHub Pages:** suba o repositório, vá em *Settings → Pages → Deploy from a
branch*, escolha a branch `main` e a pasta `/docs`.
Links: `https://SEU-USUARIO.github.io/NOME-DO-REPO/bruno`

**Vercel:** importe o repositório (o `vercel.json` já aponta para `docs/`).
Links: `https://SEU-PROJETO.vercel.app/bruno`

Links digitados com maiúscula ou acento (`/Catarina`, `/João-Pedro`) são
corrigidos automaticamente.
