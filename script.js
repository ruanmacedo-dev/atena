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

let inicio = 0;
let fim = 0;
let arquivo = null;

const ENDERECO_DA_BIBLIOTECA = "https://cdn.jsdelivr.net/npm/mediabunny@1.65.2/dist/bundles/mediabunny.min.mjs";

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

trilha.addEventListener("click", function (evento) {
    if (!(video.duration > 0)) {
        return;
    }
    const caixa = trilha.getBoundingClientRect();
    video.currentTime = (evento.clientX - caixa.left) / caixa.width * video.duration;
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
    agulha.style.left = porcento(video.currentTime);
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
        const altura = escolherAltura(mesadaDaEscada(codecDesejado()));
        qualidade.textContent = altura + "p";
        nivel = [360, 480, 720, 1080].indexOf(altura) + 1;
    }
    for (let i = 0; i < barrinhas.length; i++) {
        barrinhas[i].classList.toggle("acesa", i < nivel);
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

function escolherAltura(mesada) {
    if (mesada >= 1) {
        return 1080;
    } else if (mesada >= 0.5) {
        return 720;
    } else if (mesada >= 0.25) {
        return 480;
    } else {
        return 360;
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
    return mesada;
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
    const duracao = fim - inicio;
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
    let nomeDoCodec = "AV1";
    if (codec === "avc") {
        nomeDoCodec = "H.264";
    }

    const altura = escolherAltura(mesadaDaEscada(codec));
    let bitsPorSegundo = alvo * 8 / duracao - 192000;

    let melhor = null;
    for (let tentativa = 1; tentativa <= 4; tentativa++) {
        if (bitsPorSegundo < 150000) {
            break;
        }
        aviso.textContent = "Comprimindo em " + altura + "p " + nomeDoCodec + " (tentativa " + tentativa + " de 4)...";
        const feito = await converter(mb, { codec: codec, altura: altura, bitsPorSegundo: bitsPorSegundo });
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
    return { dados: melhor.dados, texto: altura + "p " + nomeDoCodec, semSom: melhor.semSom };
}

async function converter(mb, config) {
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

    if (config === null) {
        opcoes.copy = { mode: "forced", boundaryTolerance: 3 };
    } else {
        opcoes.video = async function (faixa) {
            const largura = faixa.displayWidth;
            const alturaOriginal = faixa.displayHeight;
            const deitado = largura >= alturaOriginal;
            const ladoMenor = deitado ? alturaOriginal : largura;
            const escolha = {
                codec: config.codec,
                forceTranscode: true,
            };
            if (ladoMenor > config.altura) {
                const fator = config.altura / ladoMenor;
                escolha.width = Math.round(largura * fator / 2) * 2;
                escolha.height = Math.round(alturaOriginal * fator / 2) * 2;
                escolha.fit = "fill";
            }
            const estatisticas = await faixa.computePacketStats(120);
            let quadros = Math.min(Math.max(estatisticas.averagePacketRate, 10), 240);
            if (config.altura <= 480 && quadros > 31) {
                escolha.frameRate = 30;
                quadros = 30;
            }
            const corrigida = config.bitsPorSegundo * 30 / quadros;
            escolha.quality = new mb.Quality({ bitrate: Math.round(corrigida) });
            return escolha;
        };
    }

    const conversao = await mb.Conversion.init(opcoes);
    const perdeuImagem = conversao.discardedTracks.some(function (d) { return d.track.isVideoTrack(); });
    const perdeuSom = conversao.discardedTracks.some(function (d) { return d.track.isAudioTrack(); });
    if (config === null && (!conversao.isValid || conversao.discardedTracks.length > 0)) {
        return null;
    }
    if (!conversao.isValid || perdeuImagem) {
        throw new Error("não consegui ler a imagem deste vídeo.");
    }
    conversao.onProgress = function (parte) {
        progresso.value = parte;
    };
    await conversao.execute();
    return { dados: saida.target.buffer, semSom: perdeuSom };
}
