/**
 * @fileoverview Script de Auditoría de Accesibilidad WCAG
 * Usa axe-core con Playwright para evaluar todas las vistas
 * 
 * Ejecutar: npm run audit:accessibility
 */

import { chromium } from 'playwright';
import pkg from '@axe-core/playwright';
const { default: AxeBuilder } = pkg;
import fs from 'fs';

// Configuración
const BASE_URL = 'http://localhost:5173';
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa'];

// Lista de URLs a auditar
const URLS_TO_AUDIT = [
    { name: 'Página de Inicio', path: '/oa' },
    { name: 'Unir Señas', path: '/oa/module/ciclo-vida/activity/cv-1' },
    { name: 'Ordenar Etapas', path: '/oa/module/ciclo-vida/activity/cv-2' },
    { name: 'Dibujar Etapa', path: '/oa/module/ciclo-vida/activity/cv-3' },
    { name: 'Descripción', path: '/oa/module/ciclo-vida/activity/cv-4' },
    { name: 'Asociar Sentidos', path: '/oa/module/ciclo-vida/activity/ci-5' },
    { name: 'Señas Sentidos', path: '/oa/module/ciclo-vida/activity/ci-6' },
    { name: 'Etiquetar Cuerpo', path: '/oa/module/ciclo-vida/activity/ci-7' },
    { name: 'Seleccionar Animales', path: '/oa/module/animales/activity/an-1' },
    { name: 'Clasificar Tabla', path: '/oa/module/animales/activity/an-2' },
    { name: 'Clasificar DragDrop', path: '/oa/module/animales/activity/an-3' },
    { name: 'Sopa de Letras', path: '/oa/module/animales/activity/an-4' },
    { name: 'Unir Comida', path: '/oa/module/animales/activity/an-5' },
    { name: 'Clasificar Dieta', path: '/oa/module/animales/activity/an-6' },
    { name: 'Clasificar Reproducción', path: '/oa/module/animales/activity/an-7' },
    { name: 'Clasifica Líneas', path: '/oa/module/animales/activity/an-9' },
    { name: 'Partes Planta', path: '/oa/module/plantas/activity/pl-1' },
    { name: 'Tipos Tallo', path: '/oa/module/plantas/activity/pl-2' },
    { name: 'Tallo Rígido', path: '/oa/module/plantas/activity/pl-3' },
    { name: 'Necesidades', path: '/oa/module/plantas/activity/pl-4' },
    { name: 'Ciclo Planta', path: '/oa/module/plantas/activity/pl-5' },
    { name: 'Factores', path: '/oa/module/ecosistemas/activity/ec-1' },
    { name: 'Cadena Alimentaria', path: '/oa/module/ecosistemas/activity/eco-2' },
    { name: 'Organismo Hábitat', path: '/oa/module/ecosistemas/activity/eco-3' },
    { name: 'Niveles Tróficos', path: '/oa/module/ecosistemas/activity/eco-4' },
    { name: 'Sistema Solar', path: '/oa/module/ecosistemas/activity/eco-5' },
    { name: 'Estaciones', path: '/oa/module/ecosistemas/activity/eco-6' },
];

async function runAudit() {
    console.log('🔍 Auditoría de Accesibilidad WCAG 2.1 AA\n');
    console.log('='.repeat(50));

    const browser = await chromium.launch({ headless: true });
    const results = [];
    let totalViolations = 0;
    let totalPasses = 0;

    for (const urlInfo of URLS_TO_AUDIT) {
        const page = await browser.newPage();
        const fullUrl = `${BASE_URL}${urlInfo.path}`;

        try {
            console.log(`\n📄 ${urlInfo.name}`);
            await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 15000 });
            await page.waitForTimeout(2000);

            const axeResults = await new AxeBuilder({ page })
                .withTags(WCAG_TAGS)
                .analyze();

            const v = axeResults.violations;
            const p = axeResults.passes.length;

            totalViolations += v.length;
            totalPasses += p;

            results.push({
                name: urlInfo.name,
                url: fullUrl,
                violations: v,
                violationsCount: v.length,
                passesCount: p
            });

            if (v.length === 0) {
                console.log(`   ✅ Sin violaciones (${p} reglas pasadas)`);
            } else {
                console.log(`   ⚠️  ${v.length} violaciones:`);
                v.forEach(viol => console.log(`      - ${viol.id}: ${viol.help}`));
            }
        } catch (error) {
            console.log(`   ❌ Error: ${error.message}`);
            results.push({ name: urlInfo.name, url: fullUrl, error: error.message, violations: [], violationsCount: 0, passesCount: 0 });
        }

        await page.close();
    }

    await browser.close();

    // Guardar reporte JSON
    fs.writeFileSync('accessibility-report.json', JSON.stringify(results, null, 2));

    // Generar HTML simple
    const html = generateHTML(results, totalViolations, totalPasses);
    fs.writeFileSync('accessibility-report.html', html);

    console.log('\n' + '='.repeat(50));
    console.log('📊 RESUMEN');
    console.log(`   Páginas: ${URLS_TO_AUDIT.length}`);
    console.log(`   Violaciones: ${totalViolations}`);
    console.log(`   Reglas pasadas: ${totalPasses}`);
    console.log(`   Cumplimiento: ${Math.round((totalPasses / (totalPasses + totalViolations)) * 100)}%`);
    console.log(`\n📄 Reportes guardados: accessibility-report.html/.json`);
}

function generateHTML(results, totalViolations, totalPasses) {
    const date = new Date().toLocaleString('es-ES');
    const pct = Math.round((totalPasses / (totalPasses + totalViolations)) * 100);

    let rows = results.map(r => {
        const badge = r.violationsCount === 0
            ? '<span style="background:#dcfce7;color:#166534;padding:2px 8px;border-radius:4px">✓ OK</span>'
            : `<span style="background:#fecaca;color:#991b1b;padding:2px 8px;border-radius:4px">${r.violationsCount} issues</span>`;

        const details = r.violations.map(v =>
            `<li><b>${v.id}</b> (${v.impact}): ${v.help}</li>`
        ).join('');

        return `
        <tr>
            <td style="padding:8px;border-bottom:1px solid #eee">${r.name}</td>
            <td style="padding:8px;border-bottom:1px solid #eee">${badge}</td>
            <td style="padding:8px;border-bottom:1px solid #eee;font-size:12px">
                ${r.violationsCount > 0 ? `<ul style="margin:0;padding-left:20px">${details}</ul>` : '-'}
            </td>
        </tr>`;
    }).join('');

    return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Reporte Accesibilidad WCAG - OA Inclusivos</title>
    <style>body{font-family:system-ui;max-width:1000px;margin:0 auto;padding:20px}
    h1{color:#1a1a1a}table{width:100%;border-collapse:collapse}th{text-align:left;background:#f5f5f5;padding:10px}
    .summary{display:flex;gap:20px;margin:20px 0}.stat{background:#f5f5f5;padding:15px;border-radius:8px;text-align:center}
    .stat-value{font-size:24px;font-weight:bold}.pass{color:#22c55e}.fail{color:#ef4444}</style>
</head>
<body>
    <h1>🔍 Reporte de Accesibilidad WCAG 2.1 AA</h1>
    <p>Generado: ${date}</p>
    
    <div class="summary">
        <div class="stat"><div class="stat-value">${results.length}</div>Páginas</div>
        <div class="stat"><div class="stat-value pass">${totalPasses}</div>Pasadas</div>
        <div class="stat"><div class="stat-value fail">${totalViolations}</div>Violaciones</div>
        <div class="stat"><div class="stat-value">${pct}%</div>Cumplimiento</div>
    </div>
    
    <table>
        <thead><tr><th>Página</th><th>Estado</th><th>Detalles</th></tr></thead>
        <tbody>${rows}</tbody>
    </table>
</body>
</html>`;
}

runAudit().catch(err => {
    console.error('Error:', err);
    process.exit(1);
});
