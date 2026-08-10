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
        <td data-i18n="paid" class="py-3 px-2 text-right text-green-600 font-bold">PAID</td>
        <td class="py-3 px-2 text-right font-semibold">RM ${price.toLocaleString('ms-MY')}</td>
      </tr>
    `;
  }).join('');

  container.innerHTML = `
    <div class="bg-white/80 backdrop-blur-xl rounded-3xl border border-white p-8 shadow-sm relative overflow-hidden">
      <div class="absolute -right-12 -top-12 w-48 h-48 bg-gradient-to-br from-green-400/20 to-primary/10 rounded-full blur-2xl pointer-events-none"></div>
      
      <div class="border-b border-white pb-5 mb-6 relative z-10 flex justify-between items-end">
        <div>
          <h2 data-i18n="package_sales_report" class="font-headline font-extrabold text-2xl text-slate-800 tracking-tight">Package Sales Report</h2>
          <p data-i18n="list_of_session_package_purcha" class="text-sm text-slate-500 mt-2 font-medium">List of session package purchase transactions by active clients.</p>
        </div>
        <div class="bg-gradient-to-r from-green-400 to-green-500 text-white px-5 py-2.5 rounded-xl shadow-lg shadow-green-500/30 flex items-center gap-2">
          <span class="material-symbols-outlined text-[20px]">payments</span>
          <span class="text-xs font-bold uppercase tracking-wider">Total: RM ${totalRevenue.toLocaleString('ms-MY')}</span>
        </div>
      </div>

      <div class="overflow-x-auto relative z-10">
        <table class="w-full text-left text-sm border-collapse">
          <thead>
            <tr class="border-b-2 border-white text-slate-400 font-extrabold uppercase tracking-widest text-[11px]">
              <th data-i18n="joined_date" class="py-4 px-4">Joined Date</th>
              <th data-i18n="client_name" class="py-4 px-4">Client Name</th>
              <th data-i18n="package_name" class="py-4 px-4">Package Name</th>
              <th data-i18n="payment_status" class="py-4 px-4 text-right">Payment Status</th>
              <th data-i18n="total_paid" class="py-4 px-4 text-right">Total Paid</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-white/50 font-medium text-slate-600">
            ${salesRows}
            <tr class="bg-gradient-to-r from-slate-50/50 to-white/80 border-t-2 border-white/80">
              <td data-i18n="total_sales_revenue" class="py-5 px-4 font-extrabold text-slate-800 text-sm uppercase tracking-wider" colspan="4">Total Sales Revenue</td>
              <td class="py-5 px-4 text-right font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary to-primary-container text-xl">RM ${totalRevenue.toLocaleString('ms-MY')}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}
