/* =========================================================================
   LÓGICA DE INTERAÇÃO, SCROLL LEVE E ENVIO PARA O WHATSAPP
   ========================================================================= */

// --- 1. GERENCIAMENTO DE SCROLL SEM TRAVAMENTOS ---
const cabecalho = document.querySelector('.cabecalho-site');
const progresso = document.querySelector('.progresso-rolagem');

window.addEventListener('scroll', function () {
    const rolagemY = window.scrollY;

    if (cabecalho) {
        if (rolagemY > 20) {
            cabecalho.classList.add('rolado');
        } else {
            cabecalho.classList.remove('rolado');
        }
    }

    if (progresso) {
        const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
        if (alturaTotal > 0) {
            const percentual = (rolagemY / alturaTotal) * 100;
            progresso.style.width = `${percentual}%`;
            progresso.style.opacity = rolagemY > 10 ? '1' : '0';
        }
    }
}, { passive: true });

// --- 2. CRIAÇÃO DO MENU DE OPÇÕES (SELECT) CUSTOMIZADO ---
// Esse código transforma as opções feias do navegador num menu moderno!
document.addEventListener('DOMContentLoaded', function () {
    const selects = document.querySelectorAll('.campo-form select');

    selects.forEach(select => {
        // Esconde o select chato do HTML original
        select.classList.add('select-escondido');

        // Cria a nova estrutura visual
        const wrapper = document.createElement('div');
        wrapper.classList.add('custom-select-wrapper');

        const trigger = document.createElement('div');
        trigger.classList.add('custom-select-trigger');

        // Pega o texto inicial
        const initialText = select.options[select.selectedIndex].text;
        const isPlaceholder = select.options[select.selectedIndex].disabled;

        trigger.innerHTML = `<span class="${isPlaceholder ? 'placeholder' : ''}">${initialText}</span>
                             <svg class="seta-select" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>`;

        const optionsList = document.createElement('div');
        optionsList.classList.add('custom-select-options');

        // Cria a lista bonitinha
        Array.from(select.options).forEach((option, index) => {
            if (option.disabled) return; // Não coloca o "Selecione..." na lista que desce

            const customOption = document.createElement('div');
            customOption.classList.add('custom-option');
            customOption.textContent = option.text;

            // O que acontece quando o cliente clica numa opção
            customOption.addEventListener('click', function (e) {
                e.stopPropagation(); // Evita bugar outros cliques

                // Atualiza o select escondido (para o envio do whatsapp funcionar)
                select.selectedIndex = index;
                select.dispatchEvent(new Event('change'));

                // Atualiza o texto do botão
                const triggerSpan = trigger.querySelector('span');
                triggerSpan.textContent = option.text;
                triggerSpan.classList.remove('placeholder');

                // Atualiza a cor de selecionado
                optionsList.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
                customOption.classList.add('selected');

                // Fecha o menu
                wrapper.classList.remove('open');
            });

            optionsList.appendChild(customOption);
        });

        // Abre e fecha o menu ao clicar no botão
        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            // Fecha qualquer outro menu aberto
            document.querySelectorAll('.custom-select-wrapper').forEach(w => {
                if (w !== wrapper) w.classList.remove('open');
            });
            wrapper.classList.toggle('open');
        });

        // Monta o quebra-cabeça na tela
        wrapper.appendChild(trigger);
        wrapper.appendChild(optionsList);
        select.parentNode.insertBefore(wrapper, select.nextSibling);
    });

    // Fecha os menus se o cliente clicar em qualquer outro lugar da tela
    document.addEventListener('click', function () {
        document.querySelectorAll('.custom-select-wrapper').forEach(w => w.classList.remove('open'));
    });
});


// --- 3. EXIBIR / OCULTAR SESSÃO DO COMPANHEIRO ---
function verificarCompanheiro() {
    const estadoCivil = document.getElementById('estado_civil').value;
    const sessaoCompanheiro = document.getElementById('sessao-companheiro');

    if (estadoCivil === 'casado(a)' || estadoCivil === 'união estável') {
        sessaoCompanheiro.style.display = 'block';
    } else {
        sessaoCompanheiro.style.display = 'none';
    }
}


// --- 4. MONTAGEM E ENVIO DA MENSAGEM DO WHATSAPP ---
document.getElementById('form-simulacao').addEventListener('submit', function (e) {
    e.preventDefault();

    // Validação da LGPD
    const lgpd = document.querySelector('input[name="lgpd"]:checked')?.value;
    if (lgpd === 'Nao Autorizo') {
        alert('Atenção: Para realizarmos a sua simulação, precisamos da sua autorização para uso dos dados conforme a LGPD. Por favor, marque "Autorizo".');
        return;
    }

    // Coleta dos dados do formulário
    const nome = document.getElementById('nome').value;
    const cpf = document.getElementById('cpf').value;
    const nascimento = document.getElementById('nascimento').value;
    const escolaridade = document.getElementById('escolaridade').value;
    const pis = document.getElementById('pis').value;
    const email = document.getElementById('email').value;
    const estadoCivil = document.getElementById('estado_civil').value;

    const filhos = document.querySelector('input[name="filhos"]:checked')?.value || 'Não informado';
    const tempoTrabalho = document.querySelector('input[name="tempo_trabalho"]:checked')?.value || 'Não informado';
    const cidade = document.getElementById('cidade').value;
    const outroImovel = document.getElementById('outro_imovel').value;
    const entrada = document.getElementById('entrada').value;
    const fgts = document.getElementById('fgts').value;
    const encaminhou = document.getElementById('encaminhou').value || 'Ninguém / Não preenchido';
    const comoConheceu = document.getElementById('como_conheceu').value;

    // Estrutura organizada da mensagem
    let mensagem = `*NOVA SOLICITAÇÃO DE SIMULAÇÃO - DOMOB* 🏠\n`;
    mensagem += `_(Formulário preenchido pelo site)_\n\n`;

    mensagem += `*1. DADOS PESSOAIS*\n`;
    mensagem += `- Nome: ${nome}\n`;
    mensagem += `- CPF: ${cpf}\n`;
    mensagem += `- Nascimento: ${nascimento}\n`;
    mensagem += `- Escolaridade: ${escolaridade}\n`;
    mensagem += `- PIS: ${pis}\n`;
    mensagem += `- E-mail: ${email}\n`;
    mensagem += `- Estado Civil: ${estadoCivil}\n\n`;

    if (estadoCivil === 'casado(a)' || estadoCivil === 'união estável') {
        mensagem += `*2. DADOS DO COMPANHEIRO(A)*\n`;
        mensagem += `- CPF: ${document.getElementById('cpf_comp').value || 'Não preenchido'}\n`;
        mensagem += `- Nascimento: ${document.getElementById('nascimento_comp').value || 'Não preenchido'}\n`;
        mensagem += `- E-mail: ${document.getElementById('email_comp').value || 'Não preenchido'}\n`;
        mensagem += `- Escolaridade: ${document.getElementById('escolaridade_comp').value || 'Não preenchido'}\n`;
        mensagem += `- PIS: ${document.getElementById('pis_comp').value || 'Não preenchido'}\n\n`;
    }

    mensagem += `*3. DETALHES DO FINANCIAMENTO*\n`;
    mensagem += `- Possui filhos menores? ${filhos}\n`;
    mensagem += `- Mais de 3 anos de carteira (36 meses)? ${tempoTrabalho}\n`;
    mensagem += `- Cidade do financiamento: ${cidade}\n`;
    mensagem += `- Outro imóvel ou herança: ${outroImovel}\n`;
    mensagem += `- Valor de entrada: ${entrada}\n`;
    mensagem += `- Uso do FGTS: ${fgts}\n\n`;

    mensagem += `*4. INFORMAÇÕES EXTRAS*\n`;
    mensagem += `- Quem indicou: ${encaminhou}\n`;
    mensagem += `- Como conheceu: ${comoConheceu}\n\n`;

    mensagem += `👉 *Autorizou o uso de dados (LGPD):* Sim\n`;
    mensagem += `⚠️ *Aguardando envio do comprovante de renda em foto/anexo logo abaixo.*`;

    // Redirecionamento direto para o WhatsApp da Domob
    const urlFormatada = `https://wa.me/5535984030660?text=${encodeURIComponent(mensagem)}`;
    window.open(urlFormatada, '_blank');
});