# Atena

Cortador de clipes que roda no navegador. Escolha um vídeo, marque o melhor momento e baixe o clipe já no tamanho certo.

**Usar agora:** https://ruanmacedo-dev.github.io/atena/

![Tela da Atena com o corte marcado e o clipe pronto para baixar](tela.png)

## Como usar

1. Clique em **Escolher vídeo**.
2. Ache o começo do momento e clique em **Marcar início**. Para chegar lá, dê play, arraste a agulha branca da barra ou use **−5 s** e **+5 s**.
3. Ache o fim do momento e clique em **Marcar fim**.
4. Clique em **Tocar trecho** para conferir o corte antes de baixar.
5. Em **Limite (MB)**, escreva o tamanho máximo que o arquivo pode ter.
6. Clique em **Cortar e comprimir** e, quando terminar, em **Baixar o clipe**.

## O que ela faz por você

- **Se o trecho já cabe no limite**, ela só corta, sem mexer na qualidade.
- **Se não cabe**, ela comprime e escolhe sozinha a maior resolução que cabe: 1080p, 720p, 480p ou 360p. A plaquinha **Qualidade** mostra a previsão antes de você clicar.
- **Usa AV1**, que entrega imagem melhor no mesmo tamanho de arquivo. Se for mandar para alguém com iPhone antigo, marque **Compatível com iPhone antigo**: o clipe sai em H.264, que toca em qualquer aparelho, com qualidade um pouco menor.

## Seu vídeo não sai do seu computador

Tudo acontece dentro do seu navegador. O vídeo não é enviado para nenhum servidor.

## Navegadores

Feita para navegadores baseados no Chromium (Chrome, Edge, Vivaldi, Brave), atualizados. Testada no Vivaldi, no Linux. Outros navegadores e celulares ainda não foram testados.

## Arquivos

| Arquivo | O que tem |
| --- | --- |
| `index.html` | o que aparece na tela |
| `estilo.css` | as cores e o visual |
| `script.js` | o que acontece quando você clica |
| `tela.png` | a imagem deste README |

## Feito com

- HTML, CSS e JavaScript, sem framework.
- [Mediabunny](https://mediabunny.dev/) para cortar e comprimir o vídeo (licença MPL-2.0).
