import React from 'react';
import MarkdownPreview from '@uiw/react-markdown-preview';
import { getDocumentById } from '../../../../docs/document_resolver';
import { getImage } from '../../../../docs/img_resolver';

type InfoProps = {
    page: string;
};

type InfoState = {};

class DocumentationView extends React.Component<InfoProps, InfoState> {
    constructor(props: any) {
        super(props);
        this.state = {};
    }

    render() {
        const { page } = this.props;
        return (
            <div style={{ margin: '36px' }}>
                <MarkdownPreview
                    source={getDocumentById(page)}
                    rehypeRewrite={async (node) => {
                        if (
                            node.tagName === 'a' &&
                            node.properties.href.indexOf('#') !== 0
                        ) {
                            delete node.properties.href;
                        } else if (node.tagName === 'img') {
                            node.properties.src = getImage(node.properties.src);
                        }
                    }}
                />
            </div>
        );
    }
}

export default DocumentationView;
