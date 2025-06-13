import SettingsSidebar from "../../components/SettingsSidebar";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[80dvh]">
      <SettingsSidebar />
      <div className="flex-1 px-8 py-8">{children}</div>
    </div>
  );
}
