import { test, expect } from '@playwright/test';

/**
 * ============================================================================
 * SCÉNARIO DE TEST : MESURE DE PERFORMANCES FRONTEND
 * ============================================================================
 * Ce test mesure les temps de chargement réels de la page en utilisant
 * l'API de navigation du navigateur (Navigation Timing API).
 */

test.describe('Tests de Performance', () => {

  test('Mesurer le temps de chargement de la page de connexion', async ({ page }) => {
    
    // Commencer à écouter les requêtes réseau
    const startTime = Date.now();
    
    // Aller sur la page de connexion
    await page.goto('http://localhost:3001/login');
    
    // Attendre que le réseau soit inactif (page complètement chargée)
    await page.waitForLoadState('networkidle');
    
    const loadTime = Date.now() - startTime;
    
    // Récupérer les métriques précises du navigateur
    const performanceTiming = JSON.parse(
      await page.evaluate(() => JSON.stringify(window.performance.timing))
    );

    // Calculer les métriques clés
    const timeToFirstByte = performanceTiming.responseStart - performanceTiming.navigationStart;
    const domInteractive = performanceTiming.domInteractive - performanceTiming.navigationStart;
    const fullPageLoad = performanceTiming.loadEventEnd - performanceTiming.navigationStart;

    console.log('📊 --- RÉSULTATS DES PERFORMANCES ---');
    console.log(`⏱️ Temps total perçu par Playwright: ${loadTime} ms`);
    console.log(`📡 Time to First Byte (TTFB): ${timeToFirstByte} ms`);
    console.log(`🖥️ DOM Interactive (Interface visible): ${domInteractive} ms`);
    console.log(`🚀 Chargement complet (Full Load): ${fullPageLoad} ms`);
    console.log('--------------------------------------');

    // Assertions de performance : On exige que la page se charge en moins de 3 secondes (3000ms)
    // Cela fera une excellente capture d'écran pour montrer vos exigences de qualité !
    expect(fullPageLoad).toBeLessThan(3000);
  });

});
