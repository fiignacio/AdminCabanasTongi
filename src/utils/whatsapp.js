export const formatWhatsAppNumber = (phone) => {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('0')) {
    cleaned = cleaned.substring(1);
  }
  // If it's a Chilean number without country code (9 digits starting with 9)
  if (cleaned.length === 9 && cleaned.startsWith('9')) {
    return `56${cleaned}`;
  }
  // If user typed 569...
  if (cleaned.startsWith('56') && cleaned.length >= 11) {
    return cleaned;
  }
  // Default fallback
  return cleaned;
};

export const generateWhatsAppLink = (phone, message) => {
  const formattedPhone = formatWhatsAppNumber(phone);
  if (!formattedPhone) return '';
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${formattedPhone}?text=${encodedMessage}`;
};

export const generateCabinMessage = (res, cabinName, template = 'confirmation') => {
  const deposit = res.depositAmount || 0;
  const total = res.totalCost || 0;
  const balance = total - deposit;
  const client = res.clientName || 'Estimado/a';
  
  if (template === 'checkin') {
    return `¡Hola *${client}*! 👋\nTe escribimos de Cabañas Manuara.\n\nTe recordamos que tu fecha de llegada (Check-in) es el *${res.startDate}* en la *${cabinName}*.\n📍 *Nuestra ubicación:* https://maps.google.com/?q=-27.15,-109.43\n\n¿A qué hora estimas tu llegada para estar atentos?\n¡Nos vemos pronto!`;
  }
  
  if (template === 'checkout') {
    return `¡Hola *${client}*! 👋\nEsperamos que hayas disfrutado mucho tu estadía en Cabañas Manuara.\n\nTe recordamos que el horario de salida (Check-out) de la *${cabinName}* es mañana a las 11:00 AM.\n¡Gracias por preferirnos! Si tienes un minuto, nos ayudaría mucho una reseña en Google o TripAdvisor. ⭐⭐⭐⭐⭐`;
  }
  
  if (template === 'payment') {
    return `¡Hola *${client}*! 👋\nTe escribimos de Cabañas Manuara para recordarte que tienes un saldo pendiente por tu reserva en la *${cabinName}*.\n\n💰 *Saldo a pagar:* $${balance.toLocaleString('es-CL')}\n\nPor favor, envíanos el comprobante cuando puedas realizar la transferencia. ¡Muchas gracias!`;
  }
  
  // Default: confirmation
  let msg = `¡Hola *${client}*! 👋\nTe escribimos de Cabañas Manuara para enviarte los detalles de tu reserva en la *${cabinName}*.\n\n`;
  msg += `📅 *Fecha:* ${res.startDate} al ${res.endDate}\n`;
  msg += `💰 *Total:* $${total.toLocaleString('es-CL')}\n`;
  if (deposit > 0) {
    msg += `✅ *Abono registrado:* $${deposit.toLocaleString('es-CL')}\n`;
    if (balance > 0) {
      msg += `⏳ *Saldo pendiente:* $${balance.toLocaleString('es-CL')}\n`;
    }
  }
  msg += `\n¡Quedamos atentos a tu visita!`;
  return msg;
};

export const generateCarMessage = (res, carName, template = 'confirmation') => {
  const deposit = res.depositAmount || 0;
  const total = res.totalCost || 0;
  const balance = total - deposit;
  const client = res.clientName || 'Estimado/a';

  if (template === 'checkin') {
    return `¡Hola *${client}*! 👋\nTe escribimos para coordinar la entrega de tu vehículo arrendado (*${carName}*).\n\nTu fecha de retiro es el *${res.startDate}*.\nPor favor confírmanos la hora exacta a la que pasarás a retirarlo o si necesitas que te lo llevemos al aeropuerto.\n¡Gracias!`;
  }

  if (template === 'payment') {
    return `¡Hola *${client}*! 👋\nTe escribimos para recordarte que tienes un saldo pendiente por el arriendo del vehículo *${carName}*.\n\n💰 *Saldo a pagar:* $${balance.toLocaleString('es-CL')}\n\nQuedamos atentos al comprobante de transferencia. ¡Saludos!`;
  }

  // Default: confirmation
  let msg = `¡Hola *${client}*! 👋\nTe escribimos para confirmar tu arriendo del vehículo *${carName}*.\n\n`;
  msg += `📅 *Fechas:* Retiro el ${res.startDate} - Devolución el ${res.endDate}\n`;
  msg += `💰 *Total:* $${total.toLocaleString('es-CL')}\n`;
  if (deposit > 0) {
    msg += `✅ *Abono registrado:* $${deposit.toLocaleString('es-CL')}\n`;
    if (balance > 0) {
      msg += `⏳ *Saldo pendiente:* $${balance.toLocaleString('es-CL')}\n`;
    }
  }
  msg += `\n¡Gracias por preferirnos!`;
  return msg;
};

export const generateQuoteMessage = (titular) => {
  return `¡Hola ${titular ? '*' + titular + '*' : 'estimado/a'}! 👋\nTe adjunto en este chat el *Documento PDF* con la cotización formal de tu estadía en Cabañas Manuara, incluyendo el desglose detallado de huéspedes y extras.\n\nRevisa el archivo adjunto y cualquier duda me avisas para poder agendar tu reserva. ¡Quedo atento/a!`;
};
