/* Devuelve el país del visitante (usando la geolocalización automática de Vercel)
   para pre-llenar el campo "País de la tarjeta" del checkout y ahorrarle un clic
   a la mayoría de los clientes. El cliente igual puede cambiarlo. */
export default function handler(req, res) {
  const country = req.headers['x-vercel-ip-country'] || '';
  res.setHeader('Cache-Control', 'no-store');
  res.status(200).json({ country });
}
