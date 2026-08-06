import { getClients } from '../../src/models/ClientModel.js';

export function renderPackagesView(container) {
  const clients = getClients();
  
  let totalRevenue = 0;
  const salesRows = clients.map(c => {
    if (!c.package || !c.package.total) return '';
    
    const price = c.package.total * 100;
    totalRevenue += price;
    
    return `
      <tr class="text-slate-700">
        <td class="py-3 px-2">${c.joinedDate || '28 Jul 2026'}</td>
        <td class="py-3 px-2 font-bold">${c.name}</td>
        <td class="py-3 px-2">${c.package.name || `${c.package.total}-Session Package`}</td>
        <td class="py-3 px-2 text-right text-green-600 font-bold">PAID</td>
        <td class="py-3 px-2 text-right font-semibold">S$ ${price.toLocaleString('en-SG')}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
      <div class="border-b border-slate-100 pb-3 mb-4">
        <h2 class="font-headline font-bold text-lg text-slate-800">Package Sales Report</h2>
        <p class="text-xs text-slate-500 mt-0.5">List of session package purchase transactions by active clients.</p>
      </div>

      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs border-collapse">
          <thead>
            <tr class="border-b border-slate-200 text-slate-400 font-bold uppercase">
              <th class="py-3 px-2">Joined Date</th>
              <th class="py-3 px-2">Client Name</th>
              <th class="py-3 px-2">Package Name</th>
              <th class="py-3 px-2 text-right">Payment Status</th>
              <th class="py-3 px-2 text-right">Total Paid</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 font-medium">
            ${salesRows}
            <tr class="bg-slate-50/50">
              <td class="py-3.5 px-2 font-bold text-slate-800" colspan="4">Total Sales Revenue</td>
              <td class="py-3.5 px-2 text-right font-extrabold text-primary text-sm">S$ ${totalRevenue.toLocaleString('en-SG')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
