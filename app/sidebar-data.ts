import * as LucidIcons from 'lucide-react';
import type { SidebarData } from '@/interfaces/types-sidebar-data';
import data from './sidebar-data.json';
import { SupportedLanguage } from '@/contexts/language-context';

type JSONSidebarData = {
	language: SupportedLanguage;
	teams: Array<{
		name: { [key in SupportedLanguage]: string };
		logo: string;
		plan: { [key in SupportedLanguage]: string };
	}>;
	navMain: Array<{
		title: { [key in SupportedLanguage]: string };
		url: string;
		icon: string;
		isActive?: boolean;
		label?: string;
		items?: Array<{
			title: { [key in SupportedLanguage]: string };
			url: string;
			label?: string;
		}>;
	}>;
	projects?: Array<{
		title: { [key in SupportedLanguage]: string };
		url: string;
		icon: string;
		moreIcon: string;
		actions: Array<{
			label: { [key in SupportedLanguage]: string };
			icon: string;
		}>;
	}>;
	moreProjectsIcon?: string;
	user?: {
		name: string;
		email: string;
		avatar: string;
	};
	userMenuItems?: Array<{
		label: { [key in SupportedLanguage]: string };
		icon: string;
	}>;
};

export function loadSidebarData(data: JSONSidebarData): SidebarData {
	return {
		language: data.language,
		teams: data.teams.map(team => ({
			name: team.name,
			logo: team.logo as keyof typeof LucidIcons,
			plan: team.plan,
		})),
		navMain: data.navMain.map(navItem => ({
			title: navItem.title,
			url: navItem.url,
			icon: navItem.icon as keyof typeof LucidIcons,
			isActive: navItem.isActive,
			label: navItem.label,
			items: navItem.items?.map(item => ({
				title: item.title,
				url: item.url,
				label: item.label,
			})),
		})),
		projects:
			data.projects?.map(project => ({
				title: project.title,
				url: project.url,
				icon: project.icon as keyof typeof LucidIcons,
				moreIcon: project.moreIcon as keyof typeof LucidIcons,
				actions: project.actions?.map(action => ({
					label: action.label,
					icon: action.icon as keyof typeof LucidIcons,
				})),
			})) || [],
		moreProjectsIcon: data.moreProjectsIcon as keyof typeof LucidIcons,
		user: data.user
			? {
					name: data.user.name,
					email: data.user.email,
					avatar: data.user.avatar,
			  }
			: undefined,
		userMenuItems:
			data.userMenuItems?.map(item => ({
				label: item.label,
				icon: item.icon as keyof typeof LucidIcons,
			})) || [],
	};
}
export const sidebarData: SidebarData = loadSidebarData(data as any);
// export const sidebarData2: SidebarData = {
//   language: "en" as SupportedLanguage,
//   teams: [
//     {
//       name: { en: "Acme Inc", da: "Acme A/S" },
//       logo: "GalleryVerticalEnd",
//       plan: { en: "Enterprise", da: "Virksomhed" },
//     },
//     {
//       name: { en: "Acme Corp.", da: "Acme Corp." },
//       logo: "AudioWaveform",
//       plan: { en: "Startup", da: "Opstart" },
//     },
//     {
//       name: { en: "Evil Corp.", da: "Ond Corp." },
//       logo: "Command",
//       plan: { en: "Free", da: "Gratis" },
//     },
//   ],
//   navMain: [
//     {
//       title: { en: "Landing Pages", da: "Legeplads" },
//       url: "#",
//       icon: "SquareTerminal",
//       isActive: true,
//       items: [
//         {
//           title: { en: "History", da: "Historik" },
//           url: "#",
//         },
//         {
//           title: { en: "Starred", da: "Stjernemarkeret" },
//           url: "#",
//         },
//         {
//           title: { en: "Settings", da: "Indstillinger" },
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: { en: "Models", da: "Modeller" },
//       url: "#",
//       icon: "Bot",
//       items: [
//         {
//           title: { en: "Genesis", da: "Genesis" },
//           url: "#",
//         },
//         {
//           title: { en: "Explorer", da: "Udforskeren" },
//           url: "#",
//         },
//         {
//           title: { en: "Quantum", da: "Kvantum" },
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: { en: "Documentation", da: "Dokumentation" },
//       url: "#",
//       icon: "BookOpen",
//       items: [
//         {
//           title: { en: "Introduction", da: "Introduktion" },
//           url: "#",
//         },
//         {
//           title: { en: "Get Started", da: "Kom i gang" },
//           url: "#",
//         },
//         {
//           title: { en: "Tutorials", da: "Vejledninger" },
//           url: "#",
//         },
//         {
//           title: { en: "Changelog", da: "Ændringslog" },
//           url: "#",
//         },
//       ],
//     },
//     {
//       title: { en: "Settings", da: "Indstillinger" },
//       url: "#",
//       icon: "Settings2",
//       items: [
//         {
//           title: { en: "General", da: "Generelt" },
//           url: "#",
//         },
//         {
//           title: { en: "Team", da: "Hold" },
//           url: "#",
//         },
//         {
//           title: { en: "Billing", da: "Fakturering" },
//           url: "#",
//         },
//         {
//           title: { en: "Limits", da: "Begrænsninger" },
//           url: "#",
//         },
//       ],
//     },
//   ],
//   projects: [
//     {
//       title: { en: "Design Engineering", da: "Designteknik" },
//       url: "#",
//       icon: "Frame",
//       moreIcon: "MoreHorizontal",
//       actions: [
//         { label: { en: "View Project", da: "Vis projekt" }, icon: "Folder" },
//         { label: { en: "Share Project", da: "Del projekt" }, icon: "Forward" },
//         { label: { en: "Delete Project", da: "Slet projekt" }, icon: "Trash2" },
//       ],
//     },
//     {
//       title: { en: "Sales & Marketing", da: "Salg & Marketing" },
//       url: "#",
//       icon: "PieChart",
//       moreIcon: "MoreHorizontal",
//       actions: [
//         { label: { en: "View Project", da: "Vis projekt" }, icon: "Folder" },
//         { label: { en: "Share Project", da: "Del projekt" }, icon: "Forward" },
//         { label: { en: "Delete Project", da: "Slet projekt" }, icon: "Trash2" },
//       ],
//     },
//     {
//       title: { en: "Travel", da: "Rejser" },
//       url: "#",
//       icon: "Map",
//       moreIcon: "MoreHorizontal",
//       actions: [
//         { label: { en: "View Project", da: "Vis projekt" }, icon: "Folder" },
//         { label: { en: "Share Project", da: "Del projekt" }, icon: "Forward" },
//         { label: { en: "Delete Project", da: "Slet projekt" }, icon: "Trash2" },
//       ],
//     },
//   ],
//   moreProjectsIcon: "MoreHorizontal",
//   user: {
//     name: "John Doe",
//     email: "john@example.com",
//     avatar: "/avatars/john-doe.jpg",
//   },
//   userMenuItems: [
//     {
//       label: { en: "Upgrade to Pro", da: "Opgrader til Pro" },
//       icon: "Sparkles",
//     },
//     { label: { en: "Account", da: "Konto" }, icon: "BadgeCheck" },
//     { label: { en: "Billing", da: "Fakturering" }, icon: "CreditCard" },
//     { label: { en: "Notifications", da: "Notifikationer" }, icon: "Bell" },
//     { label: { en: "Log out", da: "Log ud" }, icon: "LogOut" },
//   ],
// };
