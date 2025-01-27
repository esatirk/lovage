"use client";

import { MovieResult } from "moviedb-promise";

interface InfoSectionProps {
  movie: MovieResult;
  details: {
    genres: Array<{
      id: number | undefined;
      name: string;
    }>;
    credits: {
      crew: Array<{
        id: number | undefined;
        name: string;
        job: string;
      }>;
      cast: Array<{
        id: number | undefined;
        name: string;
        character: string;
        profile_path: string | null;
      }>;
    };
    status: string;
  } | null;
  onPersonClick: (id: number | undefined, name: string) => void;
}

export function InfoSection({
  movie,
  details,
  onPersonClick,
}: InfoSectionProps) {
  if (!details) return null;

  const director = details.credits.crew.find(
    (member) => member.job === "Director"
  );

  return (
    <div className="container mx-auto px-8 py-12">
      {/* Basic Info */}
      <div className="mb-12">
        {details.genres && (
          <div className="flex flex-wrap gap-2 mb-6">
            {details.genres.map((genre) => (
              <span
                key={genre.id}
                className="px-3 py-1 rounded-full bg-white/10 text-sm font-medium"
              >
                {genre.name}
              </span>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cast & Crew */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Cast & Crew</h3>
            <dl className="space-y-2">
              {director && (
                <div className="flex items-start">
                  <dt className="w-24 text-white/60">Director</dt>
                  <dd>
                    <button
                      onClick={() => onPersonClick(director.id, director.name)}
                      className="hover:text-primary transition-colors"
                    >
                      {director.name}
                    </button>
                  </dd>
                </div>
              )}
              <div className="flex items-start">
                <dt className="w-24 text-white/60">Cast</dt>
                <dd className="flex flex-wrap gap-x-2">
                  {details.credits.cast
                    .slice(0, 3)
                    .map((actor, index, array) => (
                      <span key={actor.id}>
                        <button
                          onClick={() => onPersonClick(actor.id, actor.name)}
                          className="hover:text-primary transition-colors"
                        >
                          {actor.name}
                        </button>
                        {index < array.length - 1 && ", "}
                      </span>
                    ))}
                </dd>
              </div>
            </dl>
          </div>

          {/* Production Info */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Production</h3>
            <dl className="space-y-2">
              <div className="flex items-start">
                <dt className="w-24 text-white/60">Status</dt>
                <dd>{details.status}</dd>
              </div>
              <div className="flex items-start">
                <dt className="w-24 text-white/60">Release</dt>
                <dd>
                  {new Date(movie.release_date || "").toLocaleDateString()}
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
