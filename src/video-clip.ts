import { html, css, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

@customElement("video-clip")
export class VideoClip extends LitElement {
  static styles = css`
    :host {
      display: block;
      overflow: hidden;
    }

    video {
      display: block;
      height: 100%;
      width: 100%;
      object-fit: contain;
    }
  `;

  @property({ type: String })
  src?: string;
  @property({ type: Number })
  start: number = 0;
  @property({ type: Number })
  end?: number;
  @property({ type: Number })
  pause: number = 0;

  render() {
    return html`
      <video
        src=${ifDefined(this.src)}
        .currentTime=${this.start}
        @timeupdate=${(e: { target: HTMLVideoElement }) => {
          const video = e.target;
          if (video.currentTime >= (this.end ?? video.duration)) {
            video.pause();
            video
              .animate(
                [
                  { opacity: 1, filter: "blur(0px)" },
                  { opacity: 0, filter: "blur(100px)" },
                ],
                { delay: this.pause * 1000, duration: 500 },
              )
              .finished.then(() => {
                video.currentTime = this.start;
                video
                  .animate(
                    [
                      { opacity: 0, filter: "blur(100px)" },
                      { opacity: 1, filter: "blur(0px)" },
                    ],
                    { duration: 500 },
                  )
                  .finished.then(() => video.play());
              });
          }
        }}
        autoplay
        muted
      ></video>
    `;
  }
}
