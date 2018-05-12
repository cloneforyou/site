import * as React from "react";
import styled from "styled-components";
import Link from "gatsby-link";
import Helmet from "react-helmet";
import { renderAst } from "../../utils/customComponents";

type IArticleProps = HTMLOrString & {
	title: string;
	subtitle?: NonNullableNode;
	info?: NonNullableNode;
	url?: string;
	children?: never;
};

const StyledArticle = styled.article`
	h1,
	h2 {
		margin: 0 0 0.6em;
	}
`;

const StyledHeader = styled.header`
	margin-bottom: 16pt;
`;

export class Article extends React.Component<IArticleProps> {
	public render() {
		const { title, url, subtitle, info, content, htmlAst } = this.props;

		return (
			<StyledArticle className="h-entry">
				<Helmet title={title} />
				<StyledHeader>
					<h1 className="post-title">
						{url ? (
							<Link className="p-name u-url u-uid" to={url}>
								{title}
							</Link>
						) : (
							title
						)}
					</h1>
					{subtitle && <h2 className="p-summary">{subtitle}</h2>}
					{info && <span>{info}</span>}
				</StyledHeader>
				<section>
					{content ? <p>{content}</p> : renderAst(htmlAst)}
				</section>
			</StyledArticle>
		);
	}
}
