import { motion } from 'framer-motion';
import { Smartphone, Monitor, DownloadCloud, Sparkles } from 'lucide-react';
import { GlowButton } from '@/components/ui/GlowButton';
import { useAppReleases } from '@/hooks/useAppReleases';
import { usePageSection } from '@/hooks/usePageSection';
import { SectionTitle } from './SectionTitle';

const BANNER = '/assets/myra-app/promo-banner.png';

const platformIcon = (platform: string) => (platform === 'android' ? Smartphone : Monitor);

/**
 * Mobile/desktop app download block — mirrors codeninjavik's MyraAndroidDownload
 * section: always visible, banner up top, one card per published release.
 */
export function AIAppDownloadSection() {
  const { releases: allReleases, loading } = useAppReleases();
  const releases = allReleases.filter((r) => r.platform === 'android');
  const { section } = usePageSection('android_app');
  if (section && !section.is_visible) return null;
  const buttonText = section?.button_text || 'Download';

  return (
    <section className="py-20 md:py-28 relative overflow-hidden">
      <div className="orb orb-purple w-[300px] h-[300px] top-10 left-10" />
      <div className="orb orb-blue w-[260px] h-[260px] bottom-10 right-10" style={{ animationDelay: '2s' }} />
      <div className="absolute inset-0 particle-grid opacity-20" />

      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-10"
        >
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-card border border-primary/30 text-primary text-sm font-semibold tracking-wide mb-4">
            <DownloadCloud className="w-4 h-4" /> {section?.eyebrow || 'DOWNLOADS'}
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            <SectionTitle title={section?.title ?? 'Get the'} highlight={section?.highlight ?? 'Android App'} />
          </h2>
          <p className="text-muted-foreground text-base md:text-lg">
            {section?.description || 'Your voice assistant lives in your pocket. Grab the latest build, straight from the source.'}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto mb-10 rounded-2xl overflow-hidden gradient-border"
        >
          <img src={section?.banner_url || BANNER} alt="MYRA — Your AI Assistant" className="w-full aspect-video md:aspect-[21/9] object-cover" loading="lazy" />
        </motion.div>

        {section?.button_url && (
          <div className="max-w-4xl mx-auto mb-10 text-center">
            <a href={section.button_url} target="_blank" rel="noopener noreferrer">
              <GlowButton className="px-8">
                <DownloadCloud className="w-4 h-4" /> {buttonText}
              </GlowButton>
            </a>
          </div>
        )}

        <div className={`grid gap-6 max-w-4xl mx-auto ${releases.length > 1 ? 'md:grid-cols-2' : 'max-w-xl'}`}>
          {loading ? (
            <div className="glass-card p-10 text-center text-muted-foreground text-sm">
              <div className="w-6 h-6 mx-auto mb-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Loading releases...
            </div>
          ) : releases.length === 0 ? (
            <div className="glass-card p-10 text-center text-muted-foreground text-sm">
              <Sparkles className="w-8 h-8 mx-auto mb-3 opacity-30" />
              <p>No release published yet. Check back soon.</p>
            </div>
          ) : (
            releases.map((release, i) => {
              const Icon = platformIcon(release.platform);
              return (
                <motion.div
                  key={release.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="relative rounded-2xl overflow-hidden gradient-border"
                >
                  <div className="glass-card p-6 md:p-8">
                    <div className="flex items-center gap-4 mb-5">
                      {release.icon_url ? (
                        <img src={release.icon_url} alt={release.app_name} className="w-14 h-14 rounded-2xl object-cover shrink-0 border border-primary/30" />
                      ) : (
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0">
                          <Icon className="w-7 h-7 text-primary-foreground" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="text-xl font-bold leading-tight truncate">{release.app_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          v{release.version_name}
                          {release.file_size_mb ? ` • ${release.file_size_mb} MB` : ''} • {release.platform}
                        </p>
                      </div>
                    </div>

                    {release.release_notes && (
                      <div className="mb-5 px-4 py-3 rounded-xl bg-muted/40 border border-border/50">
                        <p className="text-xs text-muted-foreground font-semibold tracking-wide mb-1">WHAT&apos;S NEW</p>
                        <p className="text-sm text-foreground/80 whitespace-pre-line">{release.release_notes}</p>
                      </div>
                    )}

                    <a href={release.download_url} target="_blank" rel="noopener noreferrer" className="block">
                      <GlowButton className="w-full">
                        <DownloadCloud className="w-4 h-4" /> {buttonText}
                      </GlowButton>
                    </a>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </section>
  );
}
