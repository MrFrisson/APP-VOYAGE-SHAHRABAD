import JSZip from 'jszip';
import { TravelAppData } from '../types/travel';

export async function exportZipArchive(appData: TravelAppData): Promise<void> {
  const zip = new JSZip();

  // 1. Full JSON data backup
  const jsonContent = JSON.stringify(appData, null, 2);
  zip.file('donnees-voyages.json', jsonContent);

  // 2. Comprehensive human-readable Markdown summary
  let md = `# Shahrabad — Carnet de Route\n\n`;
  md += `Exporté le : ${new Date().toLocaleDateString('fr-FR')} à ${new Date().toLocaleTimeString('fr-FR')}\n`;
  md += `Nombre total de voyages : ${appData.trips.length}\n\n`;

  appData.trips.forEach((trip, index) => {
    md += `## ${index + 1}. ${trip.title}\n`;
    md += `- **Pays / Régions** : ${trip.countries?.join(', ') || 'Monde'}\n`;
    md += `- **Dates** : du ${trip.startDate || '?'} au ${trip.endDate || '?'}\n`;
    md += `- **Budget prévisionnel** : ${trip.totalBudget} ${trip.currency}\n`;
    if (trip.description) md += `- **Description** : ${trip.description}\n`;

    const steps = appData.steps.filter((s) => s.tripId === trip.id);
    if (steps.length > 0) {
      md += `\n### 📍 Étapes (${steps.length}) :\n`;
      steps.forEach((s, idx) => {
        md += `${idx + 1}. **${s.destination}** (${s.country}) : ${s.nights} nuits du ${s.arrivalDate} au ${s.departureDate}\n`;
        if (s.notes) md += `   - *Note : ${s.notes}*\n`;
        if (s.transportToNext) md += `   - *Transport vers l'étape suivante : ${s.transportToNext}*\n`;
      });
    }

    const activities = appData.activities.filter((a) => a.tripId === trip.id);
    if (activities.length > 0) {
      md += `\n### 🎯 Activités (${activities.length}) :\n`;
      activities.forEach((a) => {
        md += `- **${a.name}** (${a.category}) — ${a.date || 'Date libre'} | Coût : ${a.price || 0} ${a.currency || trip.currency}\n`;
        if (a.notes) md += `  *${a.notes}*\n`;
      });
    }

    const hotels = appData.accommodations.filter((h) => h.tripId === trip.id);
    if (hotels.length > 0) {
      md += `\n### 🏨 Hébergements (${hotels.length}) :\n`;
      hotels.forEach((h) => {
        md += `- **${h.name}** (${h.city}) — du ${h.checkIn} au ${h.checkOut} | ${h.priceTotal || 0} ${h.currency || trip.currency}\n`;
        if (h.address) md += `  *Adresse : ${h.address}*\n`;
      });
    }

    const expenses = appData.expenses.filter((e) => e.tripId === trip.id);
    if (expenses.length > 0) {
      md += `\n### 💶 Dépenses & Tricount (${expenses.length}) :\n`;
      expenses.forEach((e) => {
        md += `- **${e.description}** : ${e.amount} ${e.currency} (Payé par : ${e.paidBy || 'Moi'})\n`;
      });
    }

    md += `\n---\n\n`;
  });

  zip.file('resume-voyages.md', md);

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `shahrabad-voyages-${new Date().toISOString().slice(0, 10)}.zip`;
  a.click();
  URL.revokeObjectURL(url);
}
