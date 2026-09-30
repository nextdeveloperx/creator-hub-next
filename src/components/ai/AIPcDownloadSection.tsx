import { motion } from 'framer-motion';
import { Monitor, DownloadCloud, Sparkles } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAppReleases } from '@/hooks/useAppReleases';
import { usePageSection } from '@/hooks/usePageSection';
import { SectionTitle } from './SectionTitle';

const BANNER = '/assets/myra-pc/promo-banner.png';

const pcControllerFeatures = [
  'Control your PC screen remotely',
  'Browse & manage files from your phone',
  'Send WhatsApp messages from your PC',
  'Open apps & websites with a voice command',
  'Connects straight to the Myra Android app',
  '100% free — no plan, no login required',
];

/**
 * Free PC companion download — ported from codeninjavik's MyraPcControllerDownload.
 * Always free, no purchase gate. Shows the most recent published `windows` release.
 */
export function AIPcDownloadSection() {
  const { releases, loading } = useAppReleases();
  const release = releases.find((r) => r.platform === 'windows') ?? null;
  const { section } = usePageSection('pc_controller');
  if (section && !section.is_visible) return null;

  // A link set in the admin panel wins over the latest published Windows release.
  const downloadUrl = section?.button_url || release?.download_url || null;
  const buttonText = section?.button_text || 'Download Myra PC Controller (.exe)';

  const handleDownload = () => {
    if (!downloadUrl) return;
    window.open(downloadUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-secondary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-secondary/30 text-secondary text-sm font-semibold tracking-wider mb-4">
            <Monitor size={16} /> {section?.eyebrow || 'PC CONTROLLER'}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <SectionTitle title={section?.title ?? 'Control Your PC from Your Phone'} highlight={section?.highlight ?? 'PC'} />
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            {section?.description || "Free desktop companion for Windows — connect it to the Myra Android app and control your PC's screen, files and apps right from your phone."}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-xl mx-auto"
        >
          <div className="relative rounded-2xl overflow-hidden gradient-border">
            <div className="glass-card overflow-hidden">
              <img src={section?.banner_url || BANNER} alt="Myra PC Controller" className="w-full aspect-video object-cover" loading="lazy" />

              <div className="p-6 md:p-8">
                {loading ? (
                  <div className="flex items-center justify-center py-10">
                    <div className="w-6 h-6 rounded-full border-2 border-secondary border-t-transparent animate-spin" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary to-primary flex items-center justify-center shrink-0">
                        <Monitor size={26} className="text-primary-foreground" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xl font-black text-foreground leading-tight">Myra PC Controller</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {release?.version_name ? `v${release.version_name}` : 'Windows .exe'}
                          {release?.file_size_mb ? ` • ${release.file_size_mb} MB` : ''} • Windows 10/11
                        </p>
                      </div>
                      <span className="ml-auto text-[10px] font-black px-3 py-1.5 rounded-full border border-secondary/30 bg-secondary/10 text-secondary shrink-0">
                        FREE
                      </span>
                    </div>

                    <ul className="space-y-2.5 mb-6">
                      {pcControllerFeatures.map((feature) => (
                        <li key={feature} className="flex items-start gap-2.5">
                          <span className="w-4 h-4 rounded-md bg-gradient-to-br from-secondary to-primary flex items-center justify-center shrink-0 mt-0.5">
                            <DownloadCloud size={9} className="text-primary-foreground" strokeWidth={3} />
                          </span>
                          <span className="text-sm text-foreground/70">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    {downloadUrl ? (
                      <GlowButton onClick={handleDownload} className="w-full">
                        <DownloadCloud size={18} /> {buttonText}
                      </GlowButton>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground text-sm">
                        <Sparkles size={24} className="mx-auto mb-2 opacity-30" />
                        <p>Download link coming soon.</p>
                      </div>
                    )}

                    <p className="text-[11px] text-muted-foreground text-center mt-5 leading-relaxed">
                      After the download finishes, open the file and allow{' '}
                      <span className="text-foreground/70">"More info → Run anyway"</span> if Windows SmartScreen asks.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
