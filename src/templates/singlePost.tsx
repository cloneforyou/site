import * as React from "react";
import { Entry } from "../components/Entry";
import { Helmet } from "react-helmet";
import { generateLinkedDataTag } from "../components/LinkedData";
import { graphql } from "gatsby";
import DefaultLayout from "../components/layout";
import { GeneralMetadataFragment, IMarkdownEntryFragment } from "../fragments";

interface IPostTemplateProps {
	data: GeneralMetadataFragment & { markdownRemark: IMarkdownEntryFragment };
}

export default class SinglePostTemplate extends React.Component<
	IPostTemplateProps
> {
	public render() {
		const {
			data: {
				site: {
					siteMetadata: { siteUrl },
				},
				personalJson: { name },
				markdownRemark: {
					htmlAst,
					headings,
					excerpt,
					frontmatter: { toc, date, title, description },
					timeToRead,
					parent: { birthTime, name: fileName, relativeDirectory },
					count: { words } = { words: -1 },
				},
			},
		} = this.props;

		const linkedData = {
			"@context": "http://schema.org",
			"@type": "BlogPosting",
			mainEntityOfPage: {
				"@type": "Blog",
				"@id": siteUrl,
			},
			headline: title,
			datePublished: date,
			author: {
				"@type": "Person",
				name,
			},
			description: excerpt,
		};

		return (
			<DefaultLayout>
				<Helmet>{generateLinkedDataTag(linkedData)}</Helmet>
				<Entry
					toc={toc}
					title={title}
					fileName={fileName}
					folderName={relativeDirectory}
					subtitle={description}
					publishDate={new Date(date || birthTime)}
					authors={[{ name, url: siteUrl }]}
					htmlAst={htmlAst}
					headings={headings}
					wordCount={words}
					timeToRead={timeToRead}
				/>
			</DefaultLayout>
		);
	}
}

export const pageQuery = graphql`
	query SinglePostQuery($markdownPath: String!) {
		...GeneralMetadata
		markdownRemark(fileAbsolutePath: { eq: $markdownPath }) {
			...MarkdownEntry
		}
	}
`;
