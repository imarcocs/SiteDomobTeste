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
document.addEventListener('DOMContentLoaded', function () {
    const selects = document.querySelectorAll('.campo-form select');

    selects.forEach(select => {
        select.classList.add('select-escondido');

        const wrapper = document.createElement('div');
        wrapper.classList.add('custom-select-wrapper');

        const trigger = document.createElement('div');
        trigger.classList.add('custom-select-trigger');

        const initialText = select.options[select.selectedIndex].text;
        const isPlaceholder = select.options[select.selectedIndex].disabled;

        trigger.innerHTML = `<span class="${isPlaceholder ? 'placeholder' : ''}">${initialText}</span>
                             <svg class="seta-select" height="24" viewBox="0 0 24 24" width="24" xmlns="http://www.w3.org/2000/svg"><path d="M7 10l5 5 5-5z"/></svg>`;

        const optionsList = document.createElement('div');
        optionsList.classList.add('custom-select-options');

        Array.from(select.options).forEach((option, index) => {
            if (option.disabled) return;

            const customOption = document.createElement('div');
            customOption.classList.add('custom-option');
            customOption.textContent = option.text;

            customOption.addEventListener('click', function (e) {
                e.stopPropagation();

                select.selectedIndex = index;
                select.dispatchEvent(new Event('change'));

                const triggerSpan = trigger.querySelector('span');
                triggerSpan.textContent = option.text;
                triggerSpan.classList.remove('placeholder');

                optionsList.querySelectorAll('.custom-option').forEach(opt => opt.classList.remove('selected'));
                customOption.classList.add('selected');

                wrapper.classList.remove('open');
            });

            optionsList.appendChild(customOption);
        });

        trigger.addEventListener('click', function (e) {
            e.stopPropagation();
            document.querySelectorAll('.custom-select-wrapper').forEach(w => {
                if (w !== wrapper) w.classList.remove('open');
            });
            wrapper.classList.toggle('open');
        });

        wrapper.appendChild(trigger);
        wrapper.appendChild(optionsList);
        select.parentNode.insertBefore(wrapper, select.nextSibling);
    });

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


// --- 4. MONTAGEM E ENVIO DA MENSAGEM DO WHATSAPP (COM AJUSTES DE DATA E TEXTO) ---
function formatarDataBrasileira(dataISO) {
    if (!dataISO) return 'Não preenchido';
    const partes = dataISO.split('-');
    if (partes.length !== 3) return dataISO;
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

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
    const nascimento = formatarDataBrasileira(document.getElementById('nascimento').value);
    const escolaridade = document.getElementById('escolaridade').value;
    const pis = document.getElementById('pis').value;
    const email = document.getElementById('email').value;
    const estadoCivil = document.getElementById('estado_civil').value;

    const possuiEmprestimo = document.querySelector('input[name="possui_emprestimo"]:checked')?.value || 'Não informado';
    const filhos = document.querySelector('input[name="filhos"]:checked')?.value || 'Não informado';
    const tempoTrabalho = document.querySelector('input[name="tempo_trabalho"]:checked')?.value || 'Não informado';
    const cidade = document.getElementById('cidade').value;
    const outroImovel = document.getElementById('outro_imovel').value;
    const entrada = document.getElementById('entrada').value;
    const fgts = document.getElementById('fgts').value;
    const encaminhou = document.getElementById('encaminhou').value || 'Não preenchido';
    const comoConheceu = document.getElementById('como_conheceu').value;

    // Estrutura organizada e limpa da mensagem
    let mensagem = `*NOVA SOLICITAÇÃO DE SIMULAÇÃO - DOMOB*\n`;
    mensagem += `(Formulário preenchido pelo site)\n\n`;

    mensagem += `*DADOS PESSOAIS*\n`;
    mensagem += `Nome: ${nome}\n`;
    mensagem += `CPF: ${cpf}\n`;
    mensagem += `Nascimento: ${nascimento}\n`;
    mensagem += `Escolaridade: ${escolaridade}\n`;
    mensagem += `PIS: ${pis}\n`;
    mensagem += `E-mail: ${email}\n`;
    mensagem += `Estado Civil: ${estadoCivil}\n\n`;

    if (estadoCivil === 'casado(a)' || estadoCivil === 'união estável') {
        const cpfComp = document.getElementById('cpf_comp').value || 'Não preenchido';
        const nascComp = formatarDataBrasileira(document.getElementById('nascimento_comp').value);
        const emailComp = document.getElementById('email_comp').value || 'Não preenchido';
        const escComp = document.getElementById('escolaridade_comp').value || 'Não preenchido';
        const pisComp = document.getElementById('pis_comp').value || 'Não preenchido';

        mensagem += `*DADOS DO COMPANHEIRO(A)*\n`;
        mensagem += `CPF: ${cpfComp}\n`;
        mensagem += `Nascimento: ${nascComp}\n`;
        mensagem += `E-mail: ${emailComp}\n`;
        mensagem += `Escolaridade: ${escComp}\n`;
        mensagem += `PIS: ${pisComp}\n\n`;
    }

    mensagem += `*DETALHES FINANCEIROS E DE FINANCIAMENTO*\n`;
    mensagem += `Possui outro financiamento/empréstimo: ${possuiEmprestimo}\n`;
    mensagem += `Filhos menores de idade: ${filhos}\n`;
    mensagem += `Mais de 36 meses de carteira: ${tempoTrabalho}\n`;
    mensagem += `Cidade de interesse: ${cidade}\n`;
    mensagem += `Outro imóvel ou herança: ${outroImovel}\n`;
    mensagem += `Valor de entrada: ${entrada}\n`;
    mensagem += `Uso do FGTS: ${fgts}\n\n`;

    mensagem += `*INFORMAÇÕES ADICIONAIS*\n`;
    mensagem += `Indicado por: ${encaminhou}\n`;
    mensagem += `Como conheceu a Domob: ${comoConheceu}\n\n`;

    mensagem += `*Autorização LGPD:* Sim\n\n`;
    mensagem += `Aguardando envio da foto do comprovante de renda logo abaixo.`;

    // Redirecionamento direto para o WhatsApp da Domob
    const urlFormatada = `https://wa.me/5535984030660?text=${encodeURIComponent(mensagem)}`;
    window.open(urlFormatada, '_blank');
});