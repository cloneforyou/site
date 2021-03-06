const excerptPlugin = require("eleventy-plugin-excerpt");
const cacheBusterPlugin = require("@mightyplow/eleventy-plugin-cache-buster");
const rssPlugin = require("@11ty/eleventy-plugin-rss");
const nestingTocPlugin = require("eleventy-plugin-nesting-toc");
const eleventyPluginReadingTimePlugin = require("eleventy-plugin-reading-time");
const seoPlugin = require("eleventy-plugin-seo");

const markdownIt = require("markdown-it");
const mdPluginPrism = require("markdown-it-prism");
const mdPluginAttrs = require("markdown-it-attrs");
const mdPluginAnchor = require("markdown-it-anchor");
const mdPluginFootnote = require("markdown-it-footnote");
const mdPluginCodesandboxEmbed = require("markdown-it-codesandbox-embed");

const urlInfoScraper = require("url-info-scraper");
const { memoize, deburr } = require("lodash");

const wmTypeStrings = require("./src/_data/wmType.json");
const { title, description } = require("./src/_data/site.json");
const { name: authorName, url } = require("./src/_data/me.json");

const addAsyncShortcode = require("./utils/add-async-shortcode");
const { figureShortcode } = require("./src/_shortcodes/figure");
const { embedShortcode } = require("./src/_shortcodes/embed");
const { bridgyLinksShortcode } = require("./src/_shortcodes/bridgy");
const { withCache } = require("./utils/with-cache");
const { createPool } = require("./utils/pool");

/**
 *
 * @template T
 * @template U
 * @param {T[]} arr
 * @param {(v: T) => U[]} fn
 * @returns {U[]}
 */
const flatMap = (arr, fn) =>
	arr.reduce((acc, el) => {
		acc.push(...fn(el));
		return acc;
	}, []);

const IS_PROD = process.env.NODE_ENV === "production";

function addCollection(eleventyConfig, collectionName, collectionFolders) {
	eleventyConfig.addCollection(collectionName, collection => {
		let files = flatMap(collectionFolders, folder => [
			...collection.getFilteredByGlob(`./src/${folder}/**/*.md`),
		]);

		if (IS_PROD) {
			files = files.filter(p => !p.data.draft);
		}

		files.sort((f1, f2) => f2.date - f1.date);

		return files;
	});
}

module.exports = function (eleventyConfig) {
	eleventyConfig.addAsyncShortcode = addAsyncShortcode;

	eleventyConfig.addPassthroughCopy("js");
	eleventyConfig.addPassthroughCopy("css");
	eleventyConfig.addPassthroughCopy("icons");
	eleventyConfig.addPassthroughCopy("fonts");
	eleventyConfig.addPassthroughCopy("uploads");
	eleventyConfig.addPassthroughCopy(".well-known");

	eleventyConfig.setLibrary(
		"md",
		markdownIt({
			html: true,
			breaks: true,
			linkify: true,
			typographer: true,
		})
			.use(mdPluginCodesandboxEmbed, { directory: "code-examples" })
			.use(mdPluginPrism, {})
			.use(mdPluginAttrs, {})
			.use(mdPluginAnchor, {
				permalink: true,
				permalinkBefore: false,
				permalinkSymbol: "🔗",
				slugify: s =>
					encodeURIComponent(deburr(String(s).trim().toLowerCase().replace(/\s+/g, "-"))),
			})
			.use(mdPluginFootnote, {}),
	);

	eleventyConfig.addPlugin(seoPlugin, {
		title,
		description,
		url,
		author: authorName,
		twitter: "vhfmag",
		img: "icons/icon-512x512.png",
		options: {
			titleDivider: "—",
		},
	});
	eleventyConfig.addPlugin(excerptPlugin);
	eleventyConfig.addPlugin(rssPlugin);
	eleventyConfig.addPlugin(nestingTocPlugin, {
		headingText: "Índice",
		headingTag: "summary",
		wrapper: "details",
	});
	eleventyConfig.addPlugin(eleventyPluginReadingTimePlugin);

	if (IS_PROD) {
		eleventyConfig.addPlugin(
			cacheBusterPlugin({
				outputDirectory: "public",
				sourceAttributes: { img: "src", video: "src", source: "srcset" },
				resourceExtensions: [
					"js",
					"css",
					"gif",
					"jpg",
					"jpeg",
					"png",
					// "svg", FIXME: disabled because of the dynamic /icons/icon.svg
					"webm",
					"mp4",
					"webp",
				],
			}),
		);
		eleventyConfig.addPlugin(require("./plugins/images"));
	}

	const collections = [
		{
			folders: ["posts"],
			name: "posts",
		},
		{
			folders: ["apresentacoes"],
			name: "apresentacoes",
		},
		{
			folders: ["notes"],
			name: "notes",
		},
		{
			folders: ["bookmarks"],
			name: "bookmarks",
		},
		{
			folders: ["photos"],
			name: "photos",
		},
		{
			folders: ["likes"],
			name: "likes",
			removeFromAll: true,
		},
	];

	addCollection(
		eleventyConfig,
		"tudo",
		flatMap(
			collections.filter(x => !x.removeFromAll),
			x => x.folders,
		),
	);
	for (const collection of collections) {
		addCollection(eleventyConfig, collection.name, collection.folders);
	}

	eleventyConfig.addFilter("formatDateISO", date => {
		date = new Date(date);

		if (Number.isNaN(date.valueOf())) return "";

		return date.toISOString();
	});

	eleventyConfig.addFilter("formatDate", date => {
		date = new Date(date);

		if (Number.isNaN(date.valueOf())) return "";

		const day = String(date.getDate());
		const month = String(date.getMonth() + 1);

		return `${day.padStart(2, "0")}/${month.padStart(2, "0")}/${date.getFullYear()}`;
	});

	eleventyConfig.addFilter("splitlines15", function (input) {
		const parts = input.split(" ");
		const lines = parts.reduce(function (prev, current) {
			if (!prev.length) {
				return [current];
			}

			let lastOne = prev[prev.length - 1];
			if (lastOne.length + current.length > 19) {
				return [...prev, current];
			}
			prev[prev.length - 1] = lastOne + " " + current;
			return prev;
		}, []);
		return lines;
	});

	eleventyConfig.addFilter("splitlines8", function (input) {
		const parts = input.split(" ");
		const lines = parts.reduce(function (prev, current) {
			if (!prev.length) {
				return [current];
			}

			let lastOne = prev[prev.length - 1];
			if (lastOne.length + current.length > 40) {
				return [...prev, current];
			}
			prev[prev.length - 1] = lastOne + " " + current;
			return prev;
		}, []);
		return lines;
	});

	const withPool = createPool();
	eleventyConfig.addAsyncShortcode(
		"titleFromUrl",
		IS_PROD
			? withPool(
					withCache(
						url => url,
						url => {
							return new Promise((res, _rej) => {
								urlInfoScraper(url, (error, linkInfo) => {
									if (error || !linkInfo.title) {
										console.error(error);
										res(url);
									} else {
										res(linkInfo.title);
									}
								});
							});
						},
					),
			  )
			: url => url,
	);

	eleventyConfig.addFilter("formatDateTime", date => {
		date = new Date(date);

		if (Number.isNaN(date.valueOf())) return "";

		const minute = String(date.getMinutes());
		const hour = String(date.getHours());
		const day = String(date.getDate());
		const month = String(date.getMonth() + 1);

		return `${day.padStart(2, "0")}/${month.padStart(
			2,
			"0",
		)}/${date.getFullYear()} - ${hour.padStart(2, "0")}:${minute.padStart(2, "0")}`;
	});

	eleventyConfig.addFilter("wmTypeString", wmType => wmTypeStrings[wmType]);
	eleventyConfig.addFilter("wmTypeStrings", wmTypes =>
		wmTypes.map(wmType => wmTypeStrings[wmType]),
	);

	eleventyConfig.addShortcode("figure", figureShortcode);
	eleventyConfig.addShortcode("siloEmbed", embedShortcode);
	eleventyConfig.addShortcode("bridgyLinks", bridgyLinksShortcode);

	eleventyConfig.setFrontMatterParsingOptions({ excerpt: true /* , excerpt_alias: "excerpt" */ });

	return {
		templateFormats: ["md", "njk", "pug"],
		dir: {
			input: "src",
			output: "public",
			layouts: "_layouts",
		},
	};
};
