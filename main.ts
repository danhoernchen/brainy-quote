import { App, Editor, Plugin, PluginSettingTab, Setting } from "obsidian";
import getQuote from "./getQuote";

// Remember to rename these classes and interfaces!

interface BrainyQuoteSettings {
	layoutSetting: string;
	quoteUrl: string;
	removeQuotation: boolean;
}

const DEFAULT_SETTINGS: BrainyQuoteSettings = {
	layoutSetting: ">[!quote] {quote}\n> {author}",
	quoteUrl: "https://www.brainyquote.com/link/quotebr.rss",
	removeQuotation: false,
};

export default class BrainyQuote extends Plugin {
	settings: BrainyQuoteSettings;

	addQuote = async () => {
		const quote = await getQuote({
			layout: this.settings.layoutSetting,
			url: this.settings.quoteUrl,
			removeQuotation: this.settings.removeQuotation,
		});
		const editor = this.app.workspace.activeEditor?.editor;
		editor?.replaceRange(quote, editor.getCursor());
		return quote;
	};

	async onload() {
		await this.loadSettings();

		// This creates an icon in the left ribbon.
		const ribbonIconEl = this.addRibbonIcon(
			"quote",
			"Insert BrainyQuote",
			(evt: MouseEvent) => {
				// Called when the user clicks the icon.
				this.addQuote();
			}
		);
		// Perform additional things with the ribbon
		ribbonIconEl.addClass("my-plugin-ribbon-class");

		// This adds a simple command that can be triggered anywhere
		this.addCommand({
			id: "insert-brainy-quote",
			name: "Insert brainy quote",
			editorCallback: async (editor: Editor) => {
				editor.replaceRange(await this.addQuote(), editor.getCursor());
			},
		});

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new BrainyQuoteSettingTab(this.app, this));
	}

	onunload() {}

	async loadSettings() {
		this.settings = Object.assign(
			{},
			DEFAULT_SETTINGS,
			await this.loadData()
		);
	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}

// class SampleModal extends Modal {
// 	constructor(app: App) {
// 		super(app);
// 	}

// 	onOpen() {
// 		const { contentEl } = this;
// 		contentEl.setText("Woah!");
// 	}

// 	onClose() {
// 		const { contentEl } = this;
// 		contentEl.empty();
// 	}
// }

class BrainyQuoteSettingTab extends PluginSettingTab {
	plugin: BrainyQuote;

	constructor(app: App, plugin: BrainyQuote) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		new Setting(containerEl).setName("BrainyQuote").setHeading();

		new Setting(containerEl)
			.setName("Layout")
			.setDesc(
				"User {quote} for the quote body and {author} for the author (d'uh)."
			)
			.addTextArea((text) =>
				text
					.setPlaceholder("")
					.setValue(this.plugin.settings.layoutSetting)
					.onChange(async (value) => {
						this.plugin.settings.layoutSetting = value;
						await this.plugin.saveSettings();
					})
			);

		new Setting(containerEl)
			.setName("Quote Category")
			.setDesc("Select a Category to get quotes from")
			.addDropdown((dropdown) => {
				dropdown
					.addOption(
						"https://www.brainyquote.com/link/quotebr.rss",
						"Today's Quote"
					)
					.addOption(
						"https://www.brainyquote.com/link/quotear.rss",
						"Art Quote"
					)
					.addOption(
						"https://www.brainyquote.com/link/quotefu.rss",
						"Funny Quote"
					)
					.addOption(
						"https://www.brainyquote.com/link/quotelo.rss",
						"Love Quote"
					)
					.addOption(
						"https://www.brainyquote.com/link/quotena.rss",
						"Nature Quote"
					)
					.setValue(this.plugin.settings.quoteUrl)
					.onChange(async (value) => {
						this.plugin.settings.quoteUrl = value;
						await this.plugin.saveSettings();
					});
			});
		new Setting(containerEl)
			.setName("Remove Quotation Marks?")
			.setDesc("Enable to remove quotation marks from the quote text")
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.settings.removeQuotation)
					.onChange(async (value) => {
						this.plugin.settings.removeQuotation = value;
						await this.plugin.saveSettings();
					});
			});
	}
}
