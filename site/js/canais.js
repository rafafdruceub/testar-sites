/* Canais de contato da Ampla. Único lugar a editar.
   Os href no index.html são cópia de reserva para quem navega sem JavaScript;
   ao trocar algo aqui, vale atualizar lá também. */
window.CANAIS = {
  // Agendamento on-line (Clinicorp, via Agenda Link), URL passada pelo Rafael.
  agendamento: 'https://agenda.link/os/89167?utm_source=google_rwg&source=google&rwg_token=ALcMQYaI2_l56MtiTMOtkkTGnAic76yMnkCoHj_2itS_NZxRTIgsc74Yeom0mOoXnnK6IlKBjpHn72k4RjnTBeJCFE_FCYXD8w%3D%3D',

  // TODO P2: WhatsApp oficial (ver ../pendencias.md). Número do lead.md (bio do Instagram); o site antigo usa 5561995397447.
  whatsappNumero: '5561999514592',

  // INVENTADO: mensagem pré-preenchida escrita por mim (P13).
  whatsappMensagem: 'Olá, vim pelo site da Ampla e gostaria de marcar uma avaliação.'
};

(function () {
  var c = window.CANAIS;
  var wa = 'https://wa.me/' + c.whatsappNumero + '?text=' + encodeURIComponent(c.whatsappMensagem);
  document.querySelectorAll('[data-canal="agendar"]').forEach(function (a) { a.href = c.agendamento; });
  document.querySelectorAll('[data-canal="whatsapp"]').forEach(function (a) { a.href = wa; });
})();
