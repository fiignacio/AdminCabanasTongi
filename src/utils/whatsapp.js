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

export const generateCabinMessage = (res, cabinName) => {
  const deposit = res.depositAmount || 0;
  const total = res.totalCost || 0;
  const balance = total - deposit;
  
  let msg = `¡Hola *${res.clientName}*! 👋\nTe escribimos de Cabañas Manuara para enviarte los detalles de tu reserva en la *${cabinName}*.\n\n`;
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

export const generateCarMessage = (res, carName) => {
  const deposit = res.depositAmount || 0;
  const total = res.totalCost || 0;
  const balance = total - deposit;

  let msg = `¡Hola *${res.clientName}*! 👋\nTe escribimos para confirmar tu arriendo del vehículo *${carName}*.\n\n`;
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
