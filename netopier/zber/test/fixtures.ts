// Fixtures sa načítajú ako text cez Vite (?raw), aby fungovali vo workerd bez fs.
import atom from './fixtures/atom.xml?raw';
import crzExport from './fixtures/crz-export.xml?raw';
import katasterWfs from './fixtures/kataster-wfs.json?raw';
import rdf from './fixtures/rdf.xml?raw';
import rss from './fixtures/rss.xml?raw';
import statistikaDataset from './fixtures/statistika-dataset.json?raw';
import statistikaKatalog from './fixtures/statistika-katalog.json?raw';
import tedPage from './fixtures/ted-page.json?raw';
import worldmonitorOutlets from './fixtures/worldmonitor-outlets.json?raw';

export const fixtures = { atom, crzExport, katasterWfs, rdf, rss, statistikaDataset, statistikaKatalog, tedPage, worldmonitorOutlets };
