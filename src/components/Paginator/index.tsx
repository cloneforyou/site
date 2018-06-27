import * as React from "react";
import styled from "styled-components";
import { Link } from "gatsby";

export type IPaginatorProps = ObjectOmit<GatsbyPaginatorProps<any>, "group">;

const StyledNav = styled.nav`
	display: flex;
	align-items: center;
	justify-content: center;
	margin: -4pt;

	& > * {
		margin: 4pt;
	}

	a.disabled {
		pointer-events: none;
		filter: grayscale(1);
	}
`;

const buildPath = ({
	pathPrefix,
	index,
}: {
	pathPrefix: string;
	index: number;
}) => (pathPrefix ? `/${pathPrefix}` : "") + (index === 1 ? "/" : `/${index}`);

export const Paginator: React.SFC<IPaginatorProps> = ({
	pageCount,
	pathPrefix,
	first,
	last,
	index,
}) => (
	<StyledNav>
		<Link
			className={(first && "disabled") || ""}
			to={!first ? buildPath({ pathPrefix, index: index - 1 }) : "#"}
			rel={!first ? "prev" : undefined}
			title="Página anterior"
		>
			&lt;
		</Link>
		{Array.from(new Array(pageCount))
			.map((_, i) => i + 1)
			.map(i => (
				<Link
					activeClassName="disabled"
					key={i}
					title={`Página ${i}`}
					exact={true}
					rel={
						`${i === 1 ? "first" : ""} ${
							i === pageCount ? "last" : ""
						}`.trim() || undefined
					}
					to={buildPath({ pathPrefix, index: i })}
				>
					{i}
				</Link>
			))}
		<Link
			className={(last && "disabled") || ""}
			to={!last ? buildPath({ pathPrefix, index: index + 1 }) : "#"}
			rel={!last ? "next" : undefined}
			title="Página seguinte"
		>
			&gt;
		</Link>
	</StyledNav>
);
