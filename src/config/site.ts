// ÚNICO lugar para configurar links e categorias.
export const SITE = {
  name: "SAGAZx Ofertas",
  discordUrl: process.env.NEXT_PUBLIC_DISCORD_URL || "https://discord.gg/SEU_CONVITE",
  tiktokUrl: "https://www.tiktok.com/@SEU_USUARIO",
};
export const CATEGORIES = ["Eletrônicos","Celulares","Informática","Eletrodomésticos","Áudio e som","Televisores","Games","Acessórios","Casa e decoração","Outros"];
export const STORES = ["Shopee","AliExpress","Amazon","Mercado Livre","Outras lojas"];
export const SERVICES = [
  { icon: "🌐", title: "Criação de sites", desc: "Sites personalizados, landing pages e sites para pequenos negócios.", extra: ["Responsivo","Rápido","Hospedagem gratuita ou barata"] },
  { icon: "🧩", title: "Programação Lua", desc: "Scripts para Roblox, interfaces personalizadas, sistemas e funcionalidades.", extra: ["Análise e correção de scripts","Interfaces","Sistemas"] },
  { icon: "⚙️", title: "Desenvolvimento e tecnologia", desc: "Integrações com APIs, WebSockets e sistemas econômicos.", extra: ["APIs","WebSockets","Soluções de baixo custo"] },
];
