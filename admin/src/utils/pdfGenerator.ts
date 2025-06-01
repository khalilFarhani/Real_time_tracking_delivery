import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface PDFOptions {
  title: string;
  subtitle: string;
  filename: string;
  excludeSelectors?: string[];
}

export const generateReportPDF = async (
  elementRef: React.RefObject<HTMLElement>,
  options: PDFOptions,
): Promise<void> => {
  if (!elementRef.current) {
    throw new Error('Élément de référence non trouvé');
  }

  try {
    // Attendre que tous les graphiques soient rendus
    await waitForChartsToLoad();

    // Capturer directement l'élément visible avec une approche différente
    const originalElement = elementRef.current;

    // Créer un clone pour manipulation
    const clonedElement = originalElement.cloneNode(true) as HTMLElement;

    // Créer un conteneur temporaire visible pour le rendu
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.top = '200vh'; // Positionner encore plus en bas
    tempContainer.style.left = '-500px'; // Décaler vers la gauche pour capturer plus à droite
    tempContainer.style.width = '3500px'; // Largeur énorme pour capturer tout
    tempContainer.style.minHeight = '2500px'; // Hauteur énorme
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.zIndex = '9999';
    tempContainer.style.visibility = 'hidden';
    tempContainer.style.pointerEvents = 'none';
    tempContainer.style.overflow = 'visible';
    tempContainer.style.padding = '100px'; // Padding très généreux
    tempContainer.style.margin = '0';
    tempContainer.style.transform = 'translateZ(0)'; // Force hardware acceleration
    document.body.appendChild(tempContainer);

    // Supprimer les éléments indésirables du clone
    const selectorsToRemove = [
      '.MuiFormControl-root',
      '.MuiAutocomplete-root',
      '.download-button',
      '.header-controls',
    ];

    selectorsToRemove.forEach((selector) => {
      const elements = clonedElement.querySelectorAll(selector);
      elements.forEach((element) => element.remove());
    });

    // Supprimer le HeaderCard (premier MuiCard-root)
    const headerCard = clonedElement.querySelector('.MuiCard-root');
    if (headerCard) headerCard.remove();

    // Optimiser pour l'impression
    optimizeForPrint(clonedElement);

    // Ajouter le contenu au conteneur temporaire
    tempContainer.appendChild(clonedElement);

    // Attendre un peu pour que le DOM se stabilise
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Capturer le contenu principal avec dimensions énormes
    const contentCanvas = await html2canvas(clonedElement, {
      scale: 0.8, // Scale encore plus réduit pour capturer énormément de contenu
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 45000, // Plus de temps pour le rendu
      removeContainer: false,
      foreignObjectRendering: true,
      width: Math.max(clonedElement.scrollWidth, 3500), // Largeur énorme
      height: Math.max(clonedElement.scrollHeight, 2500), // Hauteur énorme
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 3500,
      windowHeight: 2500,
    });

    // Créer le PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const margin = 10;
    const contentWidth = pageWidth - margin * 2;

    // Ajouter l'en-tête
    pdf.setFontSize(24);
    pdf.setTextColor(67, 24, 255);
    pdf.text('Rapport des Livreurs', pageWidth / 2, 25, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setTextColor(102, 102, 102);
    pdf.text(options.subtitle, pageWidth / 2, 35, { align: 'center' });

    // Ligne de séparation
    pdf.setDrawColor(67, 24, 255);
    pdf.setLineWidth(1);
    pdf.line(margin, 45, pageWidth - margin, 45);

    // Calculer les dimensions de l'image avec zoom réduit et centrage parfait
    const maxContentWidth = contentWidth * 0.85; // Utiliser 85% de la largeur pour meilleur centrage
    const zoomFactor = 1.1; // Facteur de zoom réduit pour taille plus appropriée
    const baseImgWidth = maxContentWidth * zoomFactor;

    // Ajuster si l'image dépasse la largeur de page
    const imgWidth = Math.min(baseImgWidth, contentWidth * 0.9);
    const imgHeight = (contentCanvas.height * imgWidth) / contentCanvas.width;
    let yPosition = 60; // Position après l'en-tête pour centrage vertical

    // Calculer la position X pour centrage parfait avec plus de marge
    const xPosition = (pageWidth - imgWidth) / 2;

    // Ajouter l'image du contenu
    const imgData = contentCanvas.toDataURL('image/png', 0.95); // Qualité optimisée

    if (imgHeight <= pageHeight - yPosition - margin) {
      // Tout tient sur une page - centrer l'image
      pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
    } else {
      // Pagination nécessaire
      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const availableHeight = pageHeight - yPosition - margin;
        const sliceHeight = Math.min(remainingHeight, availableHeight);
        const sourceHeight = (sliceHeight * contentCanvas.height) / imgHeight;

        // Créer un canvas pour cette section
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = contentCanvas.width;
        sliceCanvas.height = sourceHeight;
        const sliceCtx = sliceCanvas.getContext('2d');

        if (sliceCtx) {
          sliceCtx.drawImage(
            contentCanvas,
            0,
            sourceY,
            contentCanvas.width,
            sourceHeight,
            0,
            0,
            contentCanvas.width,
            sourceHeight,
          );

          pdf.addImage(
            sliceCanvas.toDataURL('image/png', 0.95),
            'PNG',
            xPosition,
            yPosition,
            imgWidth,
            sliceHeight,
          );
        }

        remainingHeight -= sliceHeight;
        sourceY += sourceHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
          yPosition = margin;
        }
      }
    }

    // Télécharger le PDF
    pdf.save(options.filename);

    // Nettoyer
    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('Erreur lors de la génération du PDF. Veuillez réessayer.');
  }
};

// Fonction pour attendre que les graphiques se chargent
const waitForChartsToLoad = async (): Promise<void> => {
  return new Promise((resolve) => {
    // Attendre que tous les canvas (graphiques) soient rendus
    const checkCharts = () => {
      const charts = document.querySelectorAll('canvas');
      let allLoaded = true;

      charts.forEach((chart) => {
        if (chart.width === 0 || chart.height === 0) {
          allLoaded = false;
        }
      });

      if (allLoaded) {
        resolve();
      } else {
        setTimeout(checkCharts, 100);
      }
    };

    setTimeout(checkCharts, 500); // Délai initial
  });
};

const optimizeForPrint = (element: HTMLElement): void => {
  // S'assurer que l'élément principal a des dimensions énormes
  element.style.width = '3500px';
  element.style.minWidth = '3500px';
  element.style.maxWidth = '3500px';
  element.style.minHeight = '2500px';
  element.style.overflow = 'visible';
  element.style.position = 'relative';
  element.style.padding = '100px';
  element.style.margin = '0';
  element.style.display = 'block';
  element.style.transform = 'translateZ(0)';
  element.style.backfaceVisibility = 'hidden';

  // Supprimer les animations et transitions
  const allElements = element.querySelectorAll('*');
  allElements.forEach((el: HTMLElement) => {
    if (el.style) {
      el.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)'; // Ombre légère pour la lisibilité
      el.style.transform = 'none';
      el.style.transition = 'none';
      el.style.animation = 'none';
      el.style.filter = 'none';
      el.style.backdropFilter = 'none';
      el.style.position = 'static'; // Éviter les problèmes de positionnement
      el.style.overflow = 'visible';
    }
  });

  // Optimiser les cartes pour l'impression avec meilleure organisation
  const cards = element.querySelectorAll('.MuiCard-root');
  cards.forEach((card: HTMLElement) => {
    card.style.border = '1px solid #e0e0e0';
    card.style.borderRadius = '12px';
    card.style.marginBottom = '20px'; // Plus d'espace entre les cartes
    card.style.backgroundColor = 'white';
    card.style.padding = '20px'; // Plus de padding interne
    card.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)';
    card.style.width = '100%';
    card.style.maxWidth = '100%';
    // Utiliser break-inside au lieu de pageBreakInside (moderne)
    card.style.breakInside = 'avoid';
  });

  // Optimiser les graphiques et s'assurer qu'ils sont visibles et centrés
  const charts = element.querySelectorAll('canvas, svg');
  charts.forEach((chart: HTMLElement) => {
    chart.style.maxWidth = '100%';
    chart.style.height = 'auto';
    chart.style.display = 'block';
    chart.style.margin = '15px auto'; // Plus d'espace autour des graphiques
    chart.style.borderRadius = '8px';
    chart.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
  });

  // Optimiser la typographie avec meilleure organisation
  const headings = element.querySelectorAll('h1, h2, h3, h4, h5, h6');
  headings.forEach((heading: HTMLElement) => {
    // Utiliser break-after au lieu de pageBreakAfter (moderne)
    heading.style.breakAfter = 'avoid';
    heading.style.color = '#333';
    heading.style.marginBottom = '15px';
    heading.style.marginTop = '10px';
    heading.style.textAlign = 'center'; // Centrer les titres
    heading.style.fontWeight = 'bold';
  });

  // Optimiser les grilles Material-UI avec meilleure organisation
  const grids = element.querySelectorAll('.MuiGrid-root');
  grids.forEach((grid: HTMLElement) => {
    grid.style.display = 'block';
    grid.style.width = '100%';
    grid.style.marginBottom = '15px';
    grid.style.padding = '10px';
    grid.style.textAlign = 'center'; // Centrer le contenu des grilles
  });

  // S'assurer que les conteneurs sont visibles et bien organisés
  const containers = element.querySelectorAll('.MuiBox-root, .MuiContainer-root');
  containers.forEach((container: HTMLElement) => {
    container.style.display = 'block';
    container.style.width = '100%';
    container.style.position = 'static';
    container.style.margin = '0 auto'; // Centrer les conteneurs
    container.style.padding = '10px';
  });

  // Optimiser les tableaux et listes avec meilleure organisation
  const tables = element.querySelectorAll('table, .MuiTable-root');
  tables.forEach((table: HTMLElement) => {
    table.style.width = '100%';
    table.style.borderCollapse = 'collapse';
    table.style.margin = '15px auto'; // Centrer les tableaux
    table.style.border = '1px solid #e0e0e0';
    table.style.borderRadius = '8px';
    table.style.overflow = 'hidden';
  });

  // Optimiser les cellules de tableau
  const tableCells = element.querySelectorAll('td, th');
  tableCells.forEach((cell: HTMLElement) => {
    cell.style.padding = '12px';
    cell.style.textAlign = 'center';
    cell.style.borderBottom = '1px solid #f0f0f0';
  });
};

export const generateLivreurReportPDF = async (
  elementRef: React.RefObject<HTMLElement>,
  periode: string,
  getPeriodeLabel: (p: string) => string,
): Promise<void> => {
  if (!elementRef.current) {
    throw new Error('Élément de référence non trouvé');
  }

  try {
    // Attendre que les graphiques se chargent
    await waitForChartsToLoad();

    const periodeLabel = getPeriodeLabel(periode);

    // Masquer temporairement les éléments indésirables
    const elementsToHide = [
      ...document.querySelectorAll('.header-controls'),
      ...document.querySelectorAll('.download-button'),
      ...document.querySelectorAll('.MuiFormControl-root'),
      ...document.querySelectorAll('.MuiAutocomplete-root'),
    ];

    const originalStyles: { element: Element; display: string }[] = [];

    elementsToHide.forEach((element) => {
      const htmlElement = element as HTMLElement;
      originalStyles.push({
        element,
        display: htmlElement.style.display,
      });
      htmlElement.style.display = 'none';
    });

    // Masquer aussi le HeaderCard
    const headerCard = elementRef.current.querySelector('.MuiCard-root') as HTMLElement;
    let headerOriginalDisplay = '';
    if (headerCard) {
      headerOriginalDisplay = headerCard.style.display;
      headerCard.style.display = 'none';
    }

    // Attendre un peu pour que les changements prennent effet
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Capturer seulement la partie contenu (après le HeaderCard)
    const contentArea = elementRef.current.querySelector('.MuiGrid-container') as HTMLElement;
    const targetElement = contentArea || elementRef.current;

    // S'assurer que l'élément cible a des dimensions énormes
    if (targetElement) {
      targetElement.style.width = '3500px';
      targetElement.style.minWidth = '3500px';
      targetElement.style.minHeight = '2500px';
      targetElement.style.overflow = 'visible';
      targetElement.style.padding = '100px';
      targetElement.style.margin = '0';
      targetElement.style.display = 'block';
      targetElement.style.transform = 'translateZ(0)';
      targetElement.style.backfaceVisibility = 'hidden';
    }

    // Capturer avec html2canvas avec dimensions énormes
    const canvas = await html2canvas(targetElement, {
      scale: 0.8, // Scale encore plus réduit pour capturer énormément de contenu
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 45000, // Plus de temps pour le rendu
      removeContainer: false,
      foreignObjectRendering: true,
      width: Math.max(targetElement.scrollWidth, 3500), // Largeur énorme
      height: Math.max(targetElement.scrollHeight, 2500), // Hauteur énorme
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 3500,
      windowHeight: 2500,
    });

    // Créer le PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Ajouter l'en-tête personnalisé
    pdf.setFontSize(24);
    pdf.setTextColor(67, 24, 255);
    pdf.text('Rapport des Livreurs', pageWidth / 2, 25, { align: 'center' });

    pdf.setFontSize(14);
    pdf.setTextColor(102, 102, 102);
    pdf.text(`Statistiques et performances détaillées - ${periodeLabel}`, pageWidth / 2, 35, {
      align: 'center',
    });

    // Ligne de séparation
    pdf.setDrawColor(67, 24, 255);
    pdf.setLineWidth(1);
    pdf.line(margin, 45, pageWidth - margin, 45);

    // Calculer les dimensions de l'image avec zoom réduit et centrage parfait
    const maxContentWidth = contentWidth * 0.85; // Utiliser 85% de la largeur pour meilleur centrage
    const zoomFactor = 1.1; // Facteur de zoom réduit pour taille plus appropriée
    const baseImgWidth = maxContentWidth * zoomFactor;

    // Ajuster si l'image dépasse la largeur de page
    const imgWidth = Math.min(baseImgWidth, contentWidth * 0.9);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let yPosition = 60; // Position après l'en-tête pour centrage vertical

    // Calculer la position X pour centrage parfait avec plus de marge
    const xPosition = (pageWidth - imgWidth) / 2;

    // Ajouter l'image du contenu avec pagination
    const imgData = canvas.toDataURL('image/png', 0.95); // Qualité optimisée

    if (imgHeight <= pageHeight - yPosition - margin) {
      // Tout tient sur une page - centrer l'image
      pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
    } else {
      // Pagination nécessaire
      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const availableHeight = pageHeight - yPosition - margin;
        const sliceHeight = Math.min(remainingHeight, availableHeight);
        const sourceHeight = (sliceHeight * canvas.height) / imgHeight;

        // Créer un canvas pour cette section
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sourceHeight;
        const sliceCtx = sliceCanvas.getContext('2d');

        if (sliceCtx) {
          sliceCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            sourceHeight,
          );

          pdf.addImage(
            sliceCanvas.toDataURL('image/png', 0.95),
            'PNG',
            xPosition,
            yPosition,
            imgWidth,
            sliceHeight,
          );
        }

        remainingHeight -= sliceHeight;
        sourceY += sourceHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
          yPosition = margin;
        }
      }
    }

    // Télécharger le PDF
    const filename = `rapport-livreurs-${periodeLabel.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    // Restaurer les styles originaux
    originalStyles.forEach(({ element, display }) => {
      (element as HTMLElement).style.display = display;
    });

    if (headerCard) {
      headerCard.style.display = headerOriginalDisplay;
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('Erreur lors de la génération du PDF. Veuillez réessayer.');
  }
};

export const generateIndividualLivreurReportPDF = async (
  elementRef: React.RefObject<HTMLElement>,
  livreurNom: string,
  periode: string,
  getPeriodeLabel: (p: string) => string,
): Promise<void> => {
  if (!elementRef.current) {
    throw new Error('Élément de référence non trouvé');
  }

  try {
    // Attendre que les graphiques se chargent
    await waitForChartsToLoad();

    const periodeLabel = getPeriodeLabel(periode);

    // Masquer temporairement les éléments indésirables
    const elementsToHide = [
      ...document.querySelectorAll('.header-controls'),
      ...document.querySelectorAll('.download-button'),
      ...document.querySelectorAll('.MuiFormControl-root'),
      ...document.querySelectorAll('.MuiAutocomplete-root'),
    ];

    const originalStyles: { element: Element; display: string }[] = [];

    elementsToHide.forEach((element) => {
      const htmlElement = element as HTMLElement;
      originalStyles.push({
        element,
        display: htmlElement.style.display,
      });
      htmlElement.style.display = 'none';
    });

    // Masquer aussi le HeaderCard (première carte avec les informations du livreur)
    const headerCard = elementRef.current.querySelector('.MuiCard-root') as HTMLElement;
    let headerOriginalDisplay = '';
    if (headerCard) {
      headerOriginalDisplay = headerCard.style.display;
      headerCard.style.display = 'none';
    }

    // Attendre un peu pour que les changements prennent effet
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Capturer tout le contenu après le header
    const targetElement = elementRef.current;

    // S'assurer que l'élément cible a des dimensions énormes
    if (targetElement) {
      targetElement.style.width = '3500px';
      targetElement.style.minWidth = '3500px';
      targetElement.style.minHeight = '2500px';
      targetElement.style.overflow = 'visible';
      targetElement.style.padding = '100px';
      targetElement.style.margin = '0';
      targetElement.style.display = 'block';
      targetElement.style.transform = 'translateZ(0)';
      targetElement.style.backfaceVisibility = 'hidden';
    }

    // Capturer avec html2canvas avec dimensions énormes
    const canvas = await html2canvas(targetElement, {
      scale: 0.8, // Scale réduit pour capturer énormément de contenu
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      imageTimeout: 45000, // Plus de temps pour le rendu
      removeContainer: false,
      foreignObjectRendering: true,
      width: Math.max(targetElement.scrollWidth, 3500), // Largeur énorme
      height: Math.max(targetElement.scrollHeight, 2500), // Hauteur énorme
      x: 0,
      y: 0,
      scrollX: 0,
      scrollY: 0,
      windowWidth: 3500,
      windowHeight: 2500,
    });

    // Créer le PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 15;
    const contentWidth = pageWidth - margin * 2;

    // Ajouter l'en-tête personnalisé pour le rapport individuel
    pdf.setFontSize(24);
    pdf.setTextColor(67, 24, 255);
    pdf.text('Rapport Livreur Individuel', pageWidth / 2, 25, { align: 'center' });

    pdf.setFontSize(16);
    pdf.setTextColor(102, 102, 102);
    pdf.text(`${livreurNom}`, pageWidth / 2, 35, { align: 'center' });

    pdf.setFontSize(12);
    pdf.setTextColor(102, 102, 102);
    pdf.text(`Analyse détaillée des performances - ${periodeLabel}`, pageWidth / 2, 45, {
      align: 'center',
    });

    // Ligne de séparation
    pdf.setDrawColor(67, 24, 255);
    pdf.setLineWidth(1);
    pdf.line(margin, 55, pageWidth - margin, 55);

    // Calculer les dimensions de l'image avec zoom réduit et centrage parfait
    const maxContentWidth = contentWidth * 0.85; // Utiliser 85% de la largeur pour meilleur centrage
    const zoomFactor = 1.1; // Facteur de zoom réduit pour taille plus appropriée
    const baseImgWidth = maxContentWidth * zoomFactor;

    // Ajuster si l'image dépasse la largeur de page
    const imgWidth = Math.min(baseImgWidth, contentWidth * 0.9);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let yPosition = 70; // Position après l'en-tête pour centrage vertical

    // Calculer la position X pour centrage parfait avec plus de marge
    const xPosition = (pageWidth - imgWidth) / 2;

    // Ajouter l'image du contenu avec pagination
    const imgData = canvas.toDataURL('image/png', 0.95); // Qualité optimisée

    if (imgHeight <= pageHeight - yPosition - margin) {
      // Tout tient sur une page - centrer l'image
      pdf.addImage(imgData, 'PNG', xPosition, yPosition, imgWidth, imgHeight);
    } else {
      // Pagination nécessaire
      let remainingHeight = imgHeight;
      let sourceY = 0;

      while (remainingHeight > 0) {
        const availableHeight = pageHeight - yPosition - margin;
        const sliceHeight = Math.min(remainingHeight, availableHeight);
        const sourceHeight = (sliceHeight * canvas.height) / imgHeight;

        // Créer un canvas pour cette section
        const sliceCanvas = document.createElement('canvas');
        sliceCanvas.width = canvas.width;
        sliceCanvas.height = sourceHeight;
        const sliceCtx = sliceCanvas.getContext('2d');

        if (sliceCtx) {
          sliceCtx.drawImage(
            canvas,
            0,
            sourceY,
            canvas.width,
            sourceHeight,
            0,
            0,
            canvas.width,
            sourceHeight,
          );

          pdf.addImage(
            sliceCanvas.toDataURL('image/png', 0.95),
            'PNG',
            xPosition,
            yPosition,
            imgWidth,
            sliceHeight,
          );
        }

        remainingHeight -= sliceHeight;
        sourceY += sourceHeight;

        if (remainingHeight > 0) {
          pdf.addPage();
          yPosition = margin;
        }
      }
    }

    // Télécharger le PDF avec nom spécifique au livreur
    const filename = `rapport-livreur-${livreurNom.toLowerCase().replace(/\s+/g, '-')}-${periodeLabel.toLowerCase().replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(filename);

    // Restaurer les styles originaux
    originalStyles.forEach(({ element, display }) => {
      (element as HTMLElement).style.display = display;
    });

    if (headerCard) {
      headerCard.style.display = headerOriginalDisplay;
    }
  } catch (error) {
    console.error('Erreur lors de la génération du PDF:', error);
    throw new Error('Erreur lors de la génération du PDF. Veuillez réessayer.');
  }
};
