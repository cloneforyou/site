import * as React from "react";
import styled from "styled-components";
import { Link } from "gatsby";

import { SocialLink } from "./SocialLink";
import { responsiveBreakpoint } from "../../utils/consts";

import { ScreenOnly } from "../../styles";

const activeLinkClassName = "active";

const HeadLink = styled(Link)`
	font-size: 2rem;
	font-weight: 800;
	line-height: 1.1;
`;

const StyledNav = styled.nav`
	padding-top: 1.6785em;
	padding-bottom: 1.6785em;

	ul {
		list-style: none;
		margin: -2pt -4pt;
		display: flex;
		flex-wrap: wrap;
		flex-direction: column;

		& ul {
			padding-left: 1em;
		}

		@media print, (max-width: ${responsiveBreakpoint}) {
			flex-direction: row;

			li,
			ul {
				display: contents;
			}

			a {
				margin: 2pt 4pt;
			}
		}

		li {
			margin: 2pt 4pt;

			a.${activeLinkClassName} {
				font-weight: bold;
			}
		}
	}
`;

const SidebarSection = styled.div``;

const StyledDescription = styled.p``;

const StyledSidebar = styled.header`
	flex: 0 0 var(--sidebarWidth);
	padding: var(--rootPadding);

	p,
	${StyledDescription}, ${SidebarSection} {
		margin: 0 0 1.6785em;
	}

	> h1 {
		margin-top: 0;
		text-transform: lowercase;
	}

	@media screen and (min-width: ${responsiveBreakpoint}) {
		max-height: 100vh;
		position: sticky;
		top: 0;
	}

	@media print, (max-width: ${responsiveBreakpoint}) {
		font-size: 0.9em;
		flex-basis: auto;
	}
`;

const SocialLinks = styled(ScreenOnly.withComponent("ul"))`
	display: grid;
	grid-template-columns: repeat(auto-fill, 1.75em);
	grid-auto-flow: row dense;
	grid-gap: 4pt;
	list-style-type: none;
	margin: 0;

	li {
		margin: 0;
	}
`;

interface ISocialInfo {
	url: string;
	serviceName: string;
	icon: string;
}

interface ISidebarProps {
	title: string;
	email: string;
	sourceUrl: string;
	description: string;
	social: ISocialInfo[];
	nav: ISidebarNavLink[];
}

export interface ISidebarNavLink {
	name: string;
	url: string;
	subNav?: ISidebarNavLink[];
}

function NavLinks({ navs }: { navs: ISidebarNavLink[] }) {
	return (
		<ul>
			{navs.map(({ name, url, subNav }) => (
				<li key={name}>
					<Link activeClassName={activeLinkClassName} to={url}>
						{name}
					</Link>
					{subNav && <NavLinks navs={subNav} />}
				</li>
			))}
		</ul>
	);
}

export const Sidebar: React.SFC<ISidebarProps> = ({
	title,
	sourceUrl,
	description,
	email,
	social,
	nav,
}) => (
	<StyledSidebar className="h-card">
		<SidebarSection>
			<HeadLink className="p-name u-uid u-url" to="/">
				{title}
			</HeadLink>
		</SidebarSection>
		<SidebarSection>
			<div>
				<a className="u-email" href={`mailto:${email}`}>
					{email}
				</a>
			</div>
			<ScreenOnly>
				<a href={sourceUrl}>ver código fonte</a>
			</ScreenOnly>
		</SidebarSection>
		<div
			dangerouslySetInnerHTML={{ __html: description }}
			className="lead p-note"
		/>
		<StyledNav>
			<NavLinks navs={nav} />
		</StyledNav>
		<SocialLinks>
			<li>
				<SocialLink
					icon="rss"
					serviceName="RSS"
					rel="alternate"
					url="/rss.xml"
				/>
			</li>
			{social.map(socialProps => (
				<li key={socialProps.serviceName}>
					<SocialLink {...socialProps} />
				</li>
			))}
		</SocialLinks>
	</StyledSidebar>
);
