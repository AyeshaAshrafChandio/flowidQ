
"use client";

import { useState, useRef } from "react";
import { PageHeader } from "@/components/page-header";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Briefcase,
  GraduationCap,
  Mail,
  Phone,
  User,
  Star,
  Globe,
  Camera,
} from "lucide-react";
import { userProfile as initialProfile } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function ProfilePage() {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState(initialProfile);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      [name]: value,
    }));
  };

  const handleSkillsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUserProfile((prevProfile) => ({
      ...prevProfile,
      skills: e.target.value.split(",").map((skill) => skill.trim()),
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile((prevProfile) => ({
          ...prevProfile,
          imageUrl: reader.result as string,
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const toggleEdit = () => {
    setIsEditing(!isEditing);
  };

  return (
    <>
      <PageHeader
        title="My Profile"
        subtitle="Your professional curriculum vitae."
      >
        <Button onClick={toggleEdit}>
          {isEditing ? "Save Changes" : "Edit Profile"}
        </Button>
      </PageHeader>
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-1 space-y-8">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div
                className="relative group cursor-pointer"
                onClick={isEditing ? handleAvatarClick : undefined}
              >
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage
                    src={userProfile.imageUrl}
                    alt={userProfile.name}
                  />
                  <AvatarFallback>
                    {userProfile.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="h-8 w-8 text-white" />
                  </div>
                )}
              </div>
               <input
                type="file"
                ref={fileInputRef}
                onChange={handleImageChange}
                className="hidden"
                accept="image/png, image/jpeg"
              />
              {isEditing ? (
                <div className="w-full px-4 space-y-2">
                  <Input
                    name="name"
                    className="text-2xl font-bold text-center"
                    value={userProfile.name}
                    onChange={handleInputChange}
                  />
                  <Input
                    name="title"
                    className="text-muted-foreground text-center"
                    value={userProfile.title}
                    onChange={handleInputChange}
                  />
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                  <p className="text-muted-foreground">{userProfile.title}</p>
                </>
              )}
              <div className="mt-4 space-y-2 text-sm text-muted-foreground w-full">
                {isEditing ? (
                  <div className="space-y-2 px-4">
                    <Input
                      name="email"
                      value={userProfile.email}
                      onChange={handleInputChange}
                      placeholder="Email"
                    />
                    <Input
                      name="phone"
                      value={userProfile.phone}
                      onChange={handleInputChange}
                      placeholder="Phone"
                    />
                    <Input
                      name="location"
                      value={userProfile.location}
                      onChange={handleInputChange}
                      placeholder="Location"
                    />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{userProfile.email}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Phone className="h-4 w-4" />
                      <span>{userProfile.phone}</span>
                    </div>
                    <div className="flex items-center justify-center gap-2">
                      <Globe className="h-4 w-4" />
                      <span>{userProfile.location}</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Skills</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Input
                  value={userProfile.skills.join(", ")}
                  onChange={handleSkillsChange}
                  placeholder="Comma-separated skills"
                />
              ) : (
                <div className="flex flex-wrap gap-2">
                  {userProfile.skills.map((skill) => (
                    <Badge key={skill} variant="secondary">
                      {skill}
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>About Me</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  name="about"
                  value={userProfile.about}
                  onChange={handleInputChange}
                  rows={5}
                  className="text-muted-foreground"
                />
              ) : (
                <p className="text-muted-foreground">{userProfile.about}</p>
              )}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Work Experience</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {userProfile.experience.map((job) => (
                <div key={job.role} className="flex gap-4">
                  <div className="p-3 bg-muted rounded-full h-fit">
                    <Briefcase className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{job.role}</h3>
                    <p className="text-sm text-muted-foreground">
                      {job.company}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {job.period}
                    </p>
                    <p className="mt-2 text-sm">{job.description}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Education</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {userProfile.education.map((edu) => (
                <div key={edu.degree} className="flex gap-4">
                  <div className="p-3 bg-muted rounded-full h-fit">
                    <GraduationCap className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{edu.degree}</h3>
                    <p className="text-sm text-muted-foreground">
                      {edu.institution}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {edu.period}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
