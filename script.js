const video = document.getElementById("video");
const escolher = document.getElementById("escolher");
const info = document.getElementById("info");
const marcarInicio = document.getElementById("marcarInicio");
const marcarFim = document.getElementById("marcarFim");
const trilha = document.getElementById("trilha");
const trecho = document.getElementById("trecho");
const agulha = document.getElementById("agulha");
const total = document.getElementById("total");
const valorInicio = document.getElementById("valorInicio");
const valorFim = document.getElementById("valorFim");
const valorCorte = document.getElementById("valorCorte");
const placaQualidade = document.getElementById("placaQualidade");
const qualidade = document.getElementById("qualidade");
const barrinhas = document.getElementById("barrinhas").children;
const alerta = document.getElementById("alerta");
const limite = document.getElementById("limite");
const comprimir = document.getElementById("comprimir");
const progresso = document.getElementById("progresso");
const aviso = document.getElementById("aviso");
const baixar = document.getElementById("baixar");
const compativel = document.getElementById("compativel");
const voltar5 = document.getElementById("voltar5");
const avancar5 = document.getElementById("avancar5");
const tocarTrecho = document.getElementById("tocarTrecho");

let inicio = 0;
let fim = 0;
let arquivo = null;
let tocandoTrecho = false;
let pulandoParaInicio = false;
let arrastando = false;
let estavaTocando = false;

const ENDERECO_DA_BIBLIOTECA = "https://cdn.jsdelivr.net/npm/mediabunny@1.65.2/dist/bundles/mediabunny.min.mjs";
const SEGUNDOS_ENTRE_QUADROS_CHAVE = 10;
const QUANTIZER_DA_AMOSTRA = 160;
const QUANTIZER_MINIMO = 80;

escolher.addEventListener("change", function () {
    if (escolher.files.length === 0) {
        return;
    }
    arquivo = escolher.files[0];
    video.src = URL.createObjectURL(arquivo);
    info.textContent = arquivo.name + " - " + Math.trunc(arquivo.size / 1024 / 1024) + " MB";
    inicio = 0;
    fim = 0;
    aviso.textContent = "";
    baixar.hidden = true;
    mostrarCorte();
});

video.addEventListener("loadedmetadata", function () {
    total.textContent = formatarTempo(Math.trunc(video.duration));
    mostrarCorte();
});

video.addEventListener("timeupdate", moverAgulha);

video.addEventListener("play", function () {
    requestAnimationFrame(acompanhar);
});

video.addEventListener("pause", pararTrecho);

video.addEventListener("seeking", function () {
    if (pulandoParaInicio) {
        pulandoParaInicio = false;
        return;
    }
    pararTrecho();
});

trilha.addEventListener("pointerdown", function (evento) {
    if (!(video.duration > 0)) {
        return;
    }
    pararTrecho();
    arrastando = true;
    estavaTocando = !video.paused;
    video.pause();
    trilha.setPointerCapture(evento.pointerId);
    trilha.classList.add("arrastando");
    irPara(segundoDoPonteiro(evento));
});

trilha.addEventListener("pointermove", function (evento) {
    if (arrastando) {
        irPara(segundoDoPonteiro(evento));
    }
});

trilha.addEventListener("pointerup", soltarAgulha);
trilha.addEventListener("pointercancel", soltarAgulha);

voltar5.addEventListener("click", function () {
    pararTrecho();
    irPara(video.currentTime - 5);
});

avancar5.addEventListener("click", function () {
    pararTrecho();
    irPara(video.currentTime + 5);
});

tocarTrecho.addEventListener("click", function () {
    if (tocandoTrecho) {
        video.pause();
        return;
    }
    pulandoParaInicio = true;
    video.currentTime = inicio;
    tocandoTrecho = true;
    tocarTrecho.textContent = "Parar";
    video.play().catch(pararTrecho);
});

marcarInicio.addEventListener("click", function () {
    inicio = Math.trunc(video.currentTime);
    mostrarCorte();
});

marcarFim.addEventListener("click", function () {
    fim = Math.trunc(video.currentTime);
    mostrarCorte();
});

limite.addEventListener("input", mostrarCorte);
compativel.addEventListener("change", mostrarCorte);

function formatarTempo(segundos) {
    const minutos = Math.floor(segundos / 60);
    const resto = segundos % 60;
    return minutos + ":" + String(resto).padStart(2, "0");
}

function formatarDuracao(segundos) {
    if (segundos < 60) {
        return segundos + " s";
    }
    return Math.floor(segundos / 60) + " min " + (segundos % 60) + " s";
}

function porcento(segundos) {
    return (segundos / video.duration * 100) + "%";
}

function moverAgulha() {
    if (!(video.duration > 0)) {
        agulha.hidden = true;
        return;
    }
    agulha.hidden = false;
    if (!arrastando) {
        agulha.style.left = porcento(video.currentTime);
    }
}

function acompanhar() {
    if (video.paused) {
        return;
    }
    moverAgulha();
    if (tocandoTrecho && video.currentTime >= fim) {
        video.pause();
        return;
    }
    requestAnimationFrame(acompanhar);
}

function irPara(segundos) {
    const destino = Math.min(Math.max(segundos, 0), video.duration);
    video.currentTime = destino;
    agulha.style.left = porcento(destino);
}

function segundoDoPonteiro(evento) {
    const caixa = trilha.getBoundingClientRect();
    return (evento.clientX - caixa.left) / caixa.width * video.duration;
}

function soltarAgulha() {
    if (!arrastando) {
        return;
    }
    arrastando = false;
    trilha.classList.remove("arrastando");
    if (estavaTocando) {
        video.play();
    }
}

function pararTrecho() {
    tocandoTrecho = false;
    tocarTrecho.textContent = "Tocar trecho";
}

function mostrarCorte() {
    const temVideo = arquivo !== null && video.duration > 0;
    const corteValido = temVideo && fim > inicio;

    valorInicio.textContent = temVideo ? formatarTempo(inicio) : "–";
    valorFim.textContent = temVideo && fim > 0 ? formatarTempo(fim) : "–";
    valorCorte.textContent = corteValido ? formatarDuracao(fim - inicio) : "–";

    if (temVideo && fim > 0 && fim <= inicio) {
        alerta.textContent = "O fim precisa vir depois do início";
    } else {
        alerta.textContent = "";
    }

    if (corteValido) {
        trecho.hidden = false;
        trecho.style.left = porcento(inicio);
        trecho.style.width = porcento(fim - inicio);
    } else if (temVideo && inicio > 0) {
        trecho.hidden = false;
        trecho.style.left = porcento(inicio);
        trecho.style.width = "0";
    } else {
        trecho.hidden = true;
    }

    let nivel = 0;
    placaQualidade.classList.remove("original");
    if (!corteValido) {
        qualidade.textContent = "–";
    } else if (cabeSemComprimir()) {
        qualidade.textContent = "Original";
        placaQualidade.classList.add("original");
        nivel = 4;
    } else {
        const degrau = escolherDegrau(mesadaDaEscada(codecDesejado()));
        const ladoMenor = Math.min(video.videoWidth, video.videoHeight);
        qualidade.textContent = Math.min(degrau.altura, ladoMenor) + "p" + degrau.quadros;
        nivel = degrau.nivel;
    }
    for (let i = 0; i < barrinhas.length; i++) {
        barrinhas[i].classList.toggle("acesa", i < nivel);
    }

    voltar5.disabled = !temVideo;
    avancar5.disabled = !temVideo;
    tocarTrecho.disabled = !corteValido;
    if (!corteValido && tocandoTrecho) {
        video.pause();
    }

    moverAgulha();
}

function limiteEmBytes() {
    return Number(limite.value) * 1000 * 1000;
}

function pesoOriginalDoCorte() {
    return arquivo.size / video.duration * (fim - inicio);
}

function cabeSemComprimir() {
    return pesoOriginalDoCorte() <= limiteEmBytes() * 0.9;
}

function escolherDegrau(mesada) {
    if (mesada >= 1.5) {
        return { altura: 1080, quadros: 60, nivel: 4 };
    } else if (mesada >= 0.36) {
        return { altura: 1080, quadros: 30, nivel: 3 };
    } else if (mesada >= 0.2) {
        return { altura: 720, quadros: 30, nivel: 2 };
    } else if (mesada >= 0.12) {
        return { altura: 480, quadros: 30, nivel: 1 };
    } else {
        return { altura: 360, quadros: 30, nivel: 1 };
    }
}

function codecDesejado() {
    if (compativel.checked) {
        return "avc";
    }
    return "av1";
}

function mesadaDaEscada(codec) {
    const mesada = Number(limite.value) / (fim - inicio);
    if (codec === "av1") {
        return mesada * 2;
    }
    return mesada * 0.6;
}

comprimir.addEventListener("click", async function () {
    if (arquivo === null) {
        aviso.textContent = "Escolha um vídeo primeiro";
        return;
    }
    if (fim <= inicio) {
        aviso.textContent = "Marque o início e o fim primeiro";
        return;
    }
    if (!(Number(limite.value) > 0)) {
        aviso.textContent = "Escreva um limite maior que zero";
        return;
    }

    comprimir.disabled = true;
    baixar.hidden = true;
    progresso.value = 0;
    progresso.hidden = false;

    try {
        const pronto = await cortarEComprimir();
        const clipe = new Blob([pronto.dados], { type: "video/mp4" });
        const nomeSemExtensao = arquivo.name.replace(/\.[^.]+$/, "");
        let texto = pronto.texto;
        if (pronto.semSom) {
            texto = texto + ", sem som";
        }
        baixar.href = URL.createObjectURL(clipe);
        baixar.download = nomeSemExtensao + "-cortado.mp4";
        baixar.textContent = "Baixar o clipe (" + (clipe.size / 1024 / 1024).toFixed(1) + " MB, " + texto + ")";
        baixar.hidden = false;
        aviso.textContent = "Pronto!";
    } catch (erro) {
        aviso.textContent = "Deu erro: " + erro.message;
        console.error(erro);
    }

    comprimir.disabled = false;
    progresso.hidden = true;
});

async function cortarEComprimir() {
    const mb = await import(ENDERECO_DA_BIBLIOTECA);
    const alvo = limiteEmBytes() * 0.95;

    if (cabeSemComprimir()) {
        aviso.textContent = "Cortando sem mexer na qualidade...";
        const copia = await converter(mb, null);
        if (copia !== null && copia.dados.byteLength <= alvo) {
            return { dados: copia.dados, texto: "qualidade original", semSom: false };
        }
    }

    if (typeof VideoEncoder === "undefined") {
        throw new Error("este navegador não consegue comprimir vídeo. Use o Chrome ou o Edge atualizados.");
    }
    let codec = codecDesejado();
    if (codec === "av1" && !(await mb.canEncodeVideo("av1"))) {
        codec = "avc";
    }
    if (!(await mb.canEncodeVideo(codec))) {
        throw new Error("este navegador não consegue comprimir vídeo. Use o Chrome ou o Edge atualizados.");
    }

    const original = await lerOriginal(mb);
    const degrau = escolherDegrau(mesadaDaEscada(codec));
    const pular = Math.max(1, Math.round(original.quadros / degrau.quadros));
    const plano = {
        codec: codec,
        altura: degrau.altura,
        pular: pular,
        quadros: original.quadros / pular,
    };

    let nome = Math.min(degrau.altura, original.ladoMenor) + "p" + Math.round(plano.quadros);
    if (codec === "avc") {
        nome = nome + " H.264";
    } else {
        nome = nome + " AV1";
    }

    const qualidadeFixa = new mb.Quality({ quantizer: QUANTIZER_DA_AMOSTRA });
    let feito;
    if (await mb.canEncodeVideo(codec, { quality: qualidadeFixa })) {
        feito = await comprimirComQualidadeFixa(mb, plano, original, nome);
    } else {
        feito = await comprimirComBitrate(mb, plano, nome);
    }
    return { dados: feito.dados, texto: nome, semSom: feito.semSom };
}

async function lerOriginal(mb) {
    const entrada = new mb.Input({ source: new mb.BlobSource(arquivo), formats: mb.ALL_FORMATS });
    const imagem = await entrada.getPrimaryVideoTrack();
    if (imagem === null) {
        throw new Error("não consegui ler a imagem deste vídeo.");
    }
    const estatisticas = await imagem.computePacketStats(120);
    let somPorSegundo = 0;
    const som = await entrada.getPrimaryAudioTrack();
    if (som !== null) {
        const estatisticasDoSom = await som.computePacketStats(200);
        somPorSegundo = estatisticasDoSom.averageBitrate / 8;
    }
    return {
        quadros: Math.min(Math.max(estatisticas.averagePacketRate, 10), 240),
        ladoMenor: Math.min(imagem.displayWidth, imagem.displayHeight),
        somPorSegundo: somPorSegundo,
    };
}

async function comprimirComQualidadeFixa(mb, plano, original, nome) {
    const duracao = fim - inicio;
    const alvo = limiteEmBytes() * 0.95;
    const mira = limiteEmBytes() * 0.87;
    let resto = original.somPorSegundo * duracao;
    if (resto >= mira) {
        throw new Error("só o som do trecho já passa do limite. Faça um corte menor.");
    }

    const estimativa = await pesarAmostra(mb, plano);
    let passo = 0.0215;
    if (estimativa > mira - resto) {
        passo = 0.019;
    }
    let quantizer = QUANTIZER_DA_AMOSTRA + Math.log(estimativa / (mira - resto)) / passo;

    let melhor = null;
    let anterior = null;
    for (let tentativa = 1; tentativa <= 4; tentativa++) {
        quantizer = Math.min(Math.max(Math.round(quantizer), QUANTIZER_MINIMO), 255);
        if (tentativa === 1) {
            aviso.textContent = "Comprimindo em " + nome + "...";
        } else {
            aviso.textContent = "Comprimindo em " + nome + " (ajuste " + tentativa + " de 4)...";
        }
        const feito = await converter(mb, plano, { quantizer: quantizer });
        const tamanho = feito.dados.byteLength;
        const imagem = (await pesarImagem(mb, feito.dados)).bytes;
        resto = tamanho - imagem;

        if (tamanho <= alvo) {
            if (melhor === null || tamanho > melhor.dados.byteLength) {
                melhor = feito;
            }
            if (tamanho >= limiteEmBytes() * 0.75 || quantizer === QUANTIZER_MINIMO) {
                break;
            }
        } else if (quantizer === 255) {
            break;
        }

        if (anterior !== null && anterior.quantizer !== quantizer) {
            passo = Math.log(anterior.imagem / imagem) / (quantizer - anterior.quantizer);
            passo = Math.min(Math.max(passo, 0.01), 0.04);
        }
        anterior = { quantizer: quantizer, imagem: imagem };

        let proximo = quantizer + Math.log(imagem / (mira - resto)) / passo;
        if (tamanho > alvo) {
            proximo = Math.max(proximo, quantizer + 2);
        }
        quantizer = proximo;
    }
    if (melhor === null) {
        throw new Error("não consegui deixar o clipe abaixo do limite. Faça um corte menor.");
    }
    return melhor;
}

async function pesarAmostra(mb, plano) {
    const duracao = fim - inicio;
    const fatias = await pesarFatiasDoOriginal(mb);
    const pedacos = Math.min(Math.max(Math.round(duracao / 3), 2), 20);
    const soma = { comprimido: 0, original: 0, chaves: 0, quantasChaves: 0 };

    for (let i = 0; i < pedacos; i++) {
        aviso.textContent = "Medindo o vídeo (amostra " + (i + 1) + " de " + pedacos + ")...";
        const fatia = Math.floor((i + 0.5) * fatias.length / pedacos);
        const trecho = { de: inicio + fatia / 2, ate: inicio + (fatia + 1) / 2 };
        const feito = await converter(mb, plano, { quantizer: QUANTIZER_DA_AMOSTRA }, trecho);
        const peso = await pesarImagem(mb, feito.dados);
        let porQuadro = peso.chaves;
        if (peso.quantosOutros > 0) {
            porQuadro = peso.outros / peso.quantosOutros;
        }
        soma.comprimido += porQuadro * (trecho.ate - trecho.de) * plano.quadros;
        soma.original += fatias[fatia];
        soma.chaves += peso.chaves;
        soma.quantasChaves += peso.quantasChaves;
        progresso.value = (i + 1) / pedacos;
    }

    let todasAsFatias = 0;
    for (const peso of fatias) {
        todasAsFatias += peso;
    }
    const chaves = Math.ceil(duracao / SEGUNDOS_ENTRE_QUADROS_CHAVE);
    const porChave = soma.chaves / soma.quantasChaves;
    return soma.comprimido / soma.original * todasAsFatias + porChave * chaves;
}

async function pesarFatiasDoOriginal(mb) {
    const entrada = new mb.Input({ source: new mb.BlobSource(arquivo), formats: mb.ALL_FORMATS });
    const faixa = await entrada.getPrimaryVideoTrack();
    const leitor = new mb.EncodedPacketSink(faixa);
    const fatias = [];
    for (let i = 0; i < (fim - inicio) * 2; i++) {
        fatias.push(1);
    }
    let primeiro = await leitor.getKeyPacket(inicio, { metadataOnly: true });
    if (primeiro === null) {
        primeiro = undefined;
    }
    for await (const pacote of leitor.packets(primeiro, undefined, { metadataOnly: true })) {
        if (pacote.timestamp >= fim + 1) {
            break;
        }
        const posicao = Math.floor((pacote.timestamp - inicio) * 2);
        if (pacote.type === "delta" && posicao >= 0 && posicao < fatias.length) {
            fatias[posicao] += pacote.byteLength;
        }
    }
    return fatias;
}

async function pesarImagem(mb, dados) {
    const leitura = new mb.Input({ source: new mb.BufferSource(dados), formats: mb.ALL_FORMATS });
    const faixa = await leitura.getPrimaryVideoTrack();
    const leitor = new mb.EncodedPacketSink(faixa);
    const peso = { chaves: 0, quantasChaves: 0, outros: 0, quantosOutros: 0, bytes: 0 };
    for await (const pacote of leitor.packets(undefined, undefined, { metadataOnly: true })) {
        if (pacote.type === "key") {
            peso.chaves += pacote.byteLength;
            peso.quantasChaves++;
        } else {
            peso.outros += pacote.byteLength;
            peso.quantosOutros++;
        }
    }
    peso.bytes = peso.chaves + peso.outros;
    return peso;
}

async function comprimirComBitrate(mb, plano, nome) {
    const duracao = fim - inicio;
    const alvo = limiteEmBytes() * 0.95;
    let bitsPorSegundo = alvo * 8 / duracao - 192000;

    let melhor = null;
    for (let tentativa = 1; tentativa <= 4; tentativa++) {
        if (bitsPorSegundo < 150000) {
            break;
        }
        aviso.textContent = "Comprimindo em " + nome + " (tentativa " + tentativa + " de 4)...";
        const feito = await converter(mb, plano, { bitsPorSegundo: bitsPorSegundo });
        const tamanho = feito.dados.byteLength;
        if (tamanho <= alvo) {
            if (melhor === null || tamanho > melhor.dados.byteLength) {
                melhor = feito;
            }
            if (tamanho >= alvo * 0.85) {
                break;
            }
        }
        bitsPorSegundo = bitsPorSegundo * (alvo / tamanho) * 0.97;
    }
    if (melhor === null) {
        throw new Error("não consegui deixar o clipe abaixo do limite. Faça um corte menor.");
    }
    return melhor;
}

async function converter(mb, plano, taxa, trecho) {
    const entrada = new mb.Input({ source: new mb.BlobSource(arquivo), formats: mb.ALL_FORMATS });
    const saida = new mb.Output({
        format: new mb.Mp4OutputFormat({ fastStart: "in-memory" }),
        target: new mb.BufferTarget(),
    });
    const opcoes = {
        input: entrada,
        output: saida,
        tracks: "primary",
        trim: { start: inicio, end: fim },
        showWarnings: false,
    };
    if (trecho !== undefined) {
        opcoes.trim = { start: trecho.de, end: trecho.ate };
        opcoes.audio = { discard: true };
    }

    if (plano === null) {
        opcoes.copy = { mode: "forced", boundaryTolerance: 3 };
    } else {
        opcoes.video = function (faixa) {
            const largura = faixa.displayWidth;
            const alturaOriginal = faixa.displayHeight;
            const deitado = largura >= alturaOriginal;
            const ladoMenor = deitado ? alturaOriginal : largura;
            const escolha = {
                codec: plano.codec,
                forceTranscode: true,
                keyFrameInterval: SEGUNDOS_ENTRE_QUADROS_CHAVE,
            };
            if (ladoMenor > plano.altura) {
                const fator = plano.altura / ladoMenor;
                escolha.width = Math.round(largura * fator / 2) * 2;
                escolha.height = Math.round(alturaOriginal * fator / 2) * 2;
                escolha.fit = "fill";
            }
            if (plano.pular > 1) {
                let contador = 0;
                escolha.process = function (quadro) {
                    const manter = contador % plano.pular === 0;
                    contador++;
                    return manter ? quadro : null;
                };
            }
            if (taxa.quantizer !== undefined) {
                escolha.quality = new mb.Quality({ quantizer: taxa.quantizer });
            } else {
                const corrigida = taxa.bitsPorSegundo * 30 / plano.quadros;
                escolha.quality = new mb.Quality({ bitrate: Math.round(corrigida) });
            }
            return escolha;
        };
    }

    const conversao = await mb.Conversion.init(opcoes);
    const perdeuImagem = conversao.discardedTracks.some(function (d) { return d.track.isVideoTrack(); });
    const perdeuSom = conversao.discardedTracks.some(function (d) { return d.track.isAudioTrack(); });
    if (plano === null && (!conversao.isValid || conversao.discardedTracks.length > 0)) {
        return null;
    }
    if (!conversao.isValid || perdeuImagem) {
        throw new Error("não consegui ler a imagem deste vídeo.");
    }
    if (trecho === undefined) {
        conversao.onProgress = function (parte) {
            progresso.value = parte;
        };
    }
    await conversao.execute();
    return { dados: saida.target.buffer, semSom: perdeuSom };
}
